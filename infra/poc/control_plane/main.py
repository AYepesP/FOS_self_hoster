import html
import sqlite3
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from urllib.parse import quote as urlquote

sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel

from apps.loader import load_catalog
from database import create_user, get_installs, get_user, init_db
from docker_client import get_container_status
from provisioner import _validate_id, deprovision, provision

_catalog = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _catalog
    init_db()
    _catalog = load_catalog()
    yield


app = FastAPI(lifespan=lifespan)


class UserCreate(BaseModel):
    user_id: str
    email: str


class ProvisionRequest(BaseModel):
    user_id: str
    app_id: str


@app.get("/catalog")
def get_catalog():
    return [
        {
            "app_id": a.app_id,
            "display_name": a.display_name,
            "privacy_tier": a.privacy_tier,
            "privacy_note": a.privacy_note,
        }
        for a in _catalog.values()
    ]


@app.post("/users", status_code=201)
def post_user(body: UserCreate):
    if get_user(body.user_id):
        raise HTTPException(status_code=409, detail=f"User '{body.user_id}' already exists")
    try:
        create_user(body.user_id, body.email)
    except sqlite3.IntegrityError as e:
        raise HTTPException(status_code=409, detail=str(e))
    return {"user_id": body.user_id}


@app.get("/users/{user_id}/installs")
def get_user_installs(user_id: str):
    if not get_user(user_id):
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found")
    return get_installs(user_id)


@app.post("/provision")
def post_provision(body: ProvisionRequest):
    try:
        return provision(body.user_id, body.app_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/deprovision")
def post_deprovision(body: ProvisionRequest):
    try:
        return deprovision(body.user_id, body.app_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status/{user_id}/{app_id}")
def get_status(user_id: str, app_id: str):
    try:
        _validate_id(user_id, "user_id")
        _validate_id(app_id, "app_id")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    container_name = f"almerno_{user_id}_{app_id}"
    return {"status": get_container_status(container_name)}


PRIVACY_TIER_LABELS = {
    "e2e": "E2E Encrypted",
    "encrypted_at_rest": "Encrypted at Rest",
    "partial": "Partial Encryption",
    "none": "Standard Privacy",
}

PRIVACY_TIER_COLORS = {
    "e2e": "#2a9d98",
    "encrypted_at_rest": "#1e6e6b",
    "partial": "#5a8a88",
    "none": "#556b6a",
}


@app.get("/", response_class=HTMLResponse)
def dashboard(request: Request, query_user: str = ""):
    app_ids = list(_catalog.keys())

    catalog_cards = ""
    for a in _catalog.values():
        label = PRIVACY_TIER_LABELS.get(a.privacy_tier, a.privacy_tier)
        color = PRIVACY_TIER_COLORS.get(a.privacy_tier, "#556b6a")
        catalog_cards += f"""
        <div class="card">
            <strong>{html.escape(a.display_name)}</strong>
            <span class="badge" style="background:{color}">{html.escape(label)}</span>
            <p class="note">{html.escape(a.privacy_note)}</p>
        </div>"""

    app_options = "".join(
        f'<option value="{html.escape(aid)}">{html.escape(aid)}</option>'
        for aid in app_ids
    )

    safe_query_user = html.escape(query_user, quote=True)
    installs_html = ""
    if query_user:
        user = get_user(query_user)
        if not user:
            installs_html = f'<p class="error">User &ldquo;{safe_query_user}&rdquo; not found.</p>'
        else:
            installs = get_installs(query_user)
            if not installs:
                installs_html = "<p>No installs.</p>"
            else:
                rows = "".join(
                    f"<tr><td>{html.escape(str(i['app_id']))}</td>"
                    f"<td>{html.escape(str(i['status']))}</td>"
                    f"<td>{html.escape(str(i.get('host_port') or '—'))}</td></tr>"
                    for i in installs
                )
                installs_html = f"""
                <table>
                    <tr><th>App</th><th>Status</th><th>Port</th></tr>
                    {rows}
                </table>"""

    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Almerno PoC</title>
<style>
  *, *::before, *::after {{ box-sizing: border-box; }}
  body {{ background: #0a1628; color: #e8ecf0; font-family: system-ui, sans-serif; margin: 0; padding: 24px; }}
  h1 {{ color: #2a9d98; margin-bottom: 8px; }}
  h2 {{ color: #2a9d98; margin-top: 32px; border-bottom: 1px solid #1e3a5f; padding-bottom: 6px; }}
  .grid {{ display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; }}
  .card {{ background: #0f2035; border: 1px solid #1e3a5f; border-radius: 8px; padding: 16px; min-width: 220px; }}
  .card strong {{ display: block; font-size: 1.05rem; margin-bottom: 6px; }}
  .badge {{ display: inline-block; font-size: 0.72rem; padding: 2px 8px; border-radius: 12px; color: #fff; margin-bottom: 8px; }}
  .note {{ font-size: 0.78rem; color: #8ea8c0; margin: 0; }}
  form {{ background: #0f2035; border: 1px solid #1e3a5f; border-radius: 8px; padding: 20px; max-width: 480px; margin-top: 12px; }}
  label {{ display: block; margin-bottom: 4px; font-size: 0.85rem; color: #8ea8c0; }}
  input, select {{ width: 100%; padding: 8px 10px; margin-bottom: 14px; background: #0a1628; border: 1px solid #2a4a6b; border-radius: 6px; color: #e8ecf0; font-size: 0.9rem; }}
  button {{ background: #2a9d98; color: #fff; border: none; padding: 9px 20px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }}
  button:hover {{ background: #238b87; }}
  table {{ border-collapse: collapse; margin-top: 10px; width: 100%; max-width: 560px; }}
  th, td {{ text-align: left; padding: 8px 12px; border-bottom: 1px solid #1e3a5f; font-size: 0.88rem; }}
  th {{ color: #8ea8c0; }}
  .error {{ color: #e07070; }}
</style>
</head>
<body>
<h1>Almerno PoC</h1>

<h2>App Catalog</h2>
<div class="grid">{catalog_cards}</div>

<h2>Create User</h2>
<form method="post" action="/users/form">
  <label>User ID</label>
  <input name="user_id" required placeholder="e.g. alice">
  <label>Email</label>
  <input name="email" type="email" required placeholder="alice@example.com">
  <button type="submit">Create User</button>
</form>

<h2>Provision App</h2>
<form method="post" action="/provision/form">
  <label>User ID</label>
  <input name="user_id" required placeholder="e.g. alice">
  <label>App</label>
  <select name="app_id">{app_options}</select>
  <button type="submit">Provision (may take up to 60s)</button>
</form>

<h2>Deprovision App</h2>
<form method="post" action="/deprovision/form">
  <label>User ID</label>
  <input name="user_id" required placeholder="e.g. alice">
  <label>App</label>
  <select name="app_id">{app_options}</select>
  <button type="submit">Deprovision</button>
</form>

<h2>View Installs</h2>
<form method="get" action="/">
  <label>User ID</label>
  <input name="query_user" value="{safe_query_user}" required placeholder="e.g. alice">
  <button type="submit">Query</button>
</form>
{installs_html}

</body>
</html>"""
    return HTMLResponse(page)


@app.post("/users/form")
def form_create_user(user_id: str = Form(...), email: str = Form(...)):
    try:
        create_user(user_id, email)
    except sqlite3.IntegrityError:
        pass
    return RedirectResponse(url=f"/?query_user={urlquote(user_id, safe='')}", status_code=303)


@app.post("/provision/form")
def form_provision(user_id: str = Form(...), app_id: str = Form(...)):
    try:
        provision(user_id, app_id)
    except (ValueError, RuntimeError):
        pass
    return RedirectResponse(url=f"/?query_user={urlquote(user_id, safe='')}", status_code=303)


@app.post("/deprovision/form")
def form_deprovision(user_id: str = Form(...), app_id: str = Form(...)):
    try:
        deprovision(user_id, app_id)
    except (ValueError, RuntimeError):
        pass
    return RedirectResponse(url=f"/?query_user={urlquote(user_id, safe='')}", status_code=303)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
