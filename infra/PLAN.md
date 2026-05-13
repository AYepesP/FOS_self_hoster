# Almerno Infrastructure — Implementation Plan

> **Status:** PoC underway on home server (2026-05-05). All architecture decisions finalized as of 2026-04-27.
> **Target capacity at launch:** ~50–100 users on a single Hetzner VPS before horizontal scaling is needed.

---

## Guiding Principles

- Every phase must leave the system in a working, testable state. No half-built phases in production.
- Complexity ratings reflect implementation effort for one focused developer, not calendar time.
- Open questions marked with `❓` must be resolved before the phase begins.

---

## Proof of Concept — Local (Home Server)

**Goal:** Prove the core engine works — encrypted volumes, Docker provisioning, per-user isolation, app lifecycle — before spending money on a VPS or setting up Traefik. Run all three apps successfully on the home server with real encryption.

**Complexity:** Medium

**Location:** `infra/poc/`

**What's deliberately simplified vs. production:**

| Production | PoC substitute |
|------------|---------------|
| Hetzner VPS | Home server (Ubuntu) |
| Traefik subdomains (`alice-vaultwarden.almerno.app`) | Random localhost ports (`localhost:32847`) |
| PostgreSQL control plane DB | SQLite |
| Hetzner Volumes | Local directories (`/opt/almerno-poc/data/`) |
| Restic backups | None |
| API authentication | None |

**What is NOT simplified (these must work exactly as in production):**
- gocryptfs encryption — always on, no toggle. Control plane refuses to start without it.
- Per-user Docker network isolation
- CPU and memory resource limits per container
- Container runs as non-root with `no-new-privileges`
- Encrypted volume unmounts when container stops — plaintext never lingers on disk

**Stack:**
- Python 3.12 + FastAPI
- Docker SDK for Python (`docker-py`) — no subprocess calls to Docker CLI
- gocryptfs for encrypted volumes
- aiosqlite for the SQLite control plane DB

**File structure:**
```
infra/poc/
├── setup.sh                          # installs gocryptfs + python deps
├── .env.example                      # MASTER_SECRET, DATA_ROOT, DB_PATH
├── requirements.txt
└── control_plane/
    ├── main.py                       # FastAPI app + HTML dashboard
    ├── provisioner.py                # orchestration: encryption + docker
    ├── docker_client.py              # Docker SDK wrapper
    ├── encryption.py                 # gocryptfs wrapper
    ├── database.py                   # SQLite schema + queries
    ├── models.py                     # Pydantic models
    └── apps/
        ├── base.py                   # AppConfig dataclass
        ├── vaultwarden.py
        ├── actual_budget.py
        └── mealie.py
```

**Steps:**

- [x] Design encryption layer (`encryption.py`) — gocryptfs init/mount/unmount, key derivation
- [x] Design Docker management layer (`docker_client.py`) — networks, containers, resource limits
- [x] App catalog (`apps/`) — AppConfig dataclass + 3 app definitions
- [x] Database layer (`database.py`) — SQLite schema, install CRUD
- [x] Provisioner (`provisioner.py`) — orchestrates encryption + Docker in the right order; includes path traversal validation
- [ ] API + dashboard (`main.py`) — FastAPI routes + browser UI
- [ ] `setup.sh`
- [ ] End-to-end test: provision all 3 apps, verify encryption on disk, deprovision, verify plaintext gone

**Validate before moving to Phase 0:**
- [ ] All 3 apps provision successfully and are accessible in the browser
- [ ] `ls /opt/almerno-poc/data/alice/vaultwarden/encrypted/` shows ciphertext, not readable files
- [ ] After deprovisioning, the plaintext mount is gone; encrypted folder remains
- [ ] Two users' containers cannot reach each other (ping test between containers)
- [ ] `docker stats` confirms memory and CPU caps are enforced

---

## Phase 0 — Host Setup

**Goal:** A hardened, production-ready VPS running Docker and Traefik with wildcard TLS. A developer can SSH in, run a container, and reach it at `{subdomain}.almerno.app` over HTTPS within one minute of provisioning.

**Complexity:** Medium

**Prerequisites / open questions:**
- ❓ Hetzner account created and billing configured
- ❓ `almerno.app` DNS managed by a provider that supports Let's Encrypt DNS-01 challenge (Cloudflare recommended — widely supported by Traefik's ACME providers)
- ❓ Hetzner API token created for Volume management (needed in Phase 3)

**Steps:**

- [ ] Provision a Hetzner Ashburn VPS (CPX51 or AX41 class: 8–16 cores, 32–64GB RAM, NVMe local disk)
- [ ] Install Ubuntu 24.04 LTS (pin the OS version — do not use rolling releases)
- [ ] OS hardening:
  - [ ] Disable password SSH login — key-based only
  - [ ] Configure `ufw`: allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), deny everything else
  - [ ] Enable automatic security updates (`unattended-upgrades`) for OS packages only
  - [ ] Set system timezone to UTC (all user timezones are injected per-container via `TZ` env var — the host must be neutral)
  - [ ] Set system locale to `en_US.UTF-8` as the baseline
- [ ] Install Docker Engine (pin to a specific version, e.g. `5:26.x.x`; never `latest`)
- [ ] Install Docker Compose plugin (v2, not the legacy standalone binary)
- [ ] Create a dedicated non-root OS user (`almerno`) for running containers; add to the `docker` group
- [ ] Deploy Traefik as a persistent Docker container (managed by a dedicated `docker-compose.yml` in `/opt/almerno/traefik/`):
  - [ ] Configure Traefik to watch Docker socket for new containers via labels
  - [ ] Configure Let's Encrypt DNS-01 challenge for `*.almerno.app` wildcard cert (Cloudflare DNS plugin or equivalent)
  - [ ] Store ACME certificate data in a named volume so it survives Traefik restarts
  - [ ] Enable Traefik dashboard on a non-public port (127.0.0.1 only, accessible via SSH tunnel)
  - [ ] Enable HTTPS redirect — all HTTP traffic auto-redirected to HTTPS
- [ ] Create base directory structure:
  ```
  /opt/almerno/
    traefik/          # Traefik compose file, acme.json
    apps/             # Per-user app compose files: apps/{user_id}/{app_id}/docker-compose.yml
    volumes/          # Symlinks or mount points for Hetzner Volumes (Phase 3)
  ```
- [ ] Validate: spin up a test container with a Traefik label, confirm it's reachable at `test.almerno.app` over HTTPS with a valid cert, then tear it down

---

## Phase 1 — Control Plane

**Goal:** A running backend service that accepts API calls to provision and deprovision user apps. It generates Docker Compose configs, starts/stops containers, registers Traefik routes, and persists state. This is the core engine of Almerno.

**Complexity:** High

**Prerequisites / open questions:**
- ❓ Choose backend language/framework (Python + FastAPI recommended: fast to write, async-capable, good Docker SDK support — but founder's preference should decide)
- ❓ Choose control plane database (PostgreSQL recommended; this is the *control plane's own* database, not per-user databases — for the MVP app trio, user apps all use SQLite internally and don't need their own Postgres)
- Phase 0 complete

**Data model — what the control plane must store:**

| Table | Key columns |
|-------|-------------|
| `users` | `user_id`, `email`, `timezone`, `created_at`, `subscription_status` |
| `installs` | `install_id`, `user_id`, `app_id`, `image_digest`, `status`, `compose_path`, `volume_path`, `traefik_hostname`, `created_at`, `updated_at` |
| `app_catalog` | `app_id`, `app_name`, `image_repo`, `current_pinned_digest`, `compose_template_path` |

**Steps:**

- [ ] Bootstrap the control plane service (choose language, set up repo structure, Dockerfile for the service itself)
- [ ] Set up the control plane's PostgreSQL database (run as a Docker container on the host, separate from user apps, accessible only on the internal Docker network)
- [ ] Implement data model — migrations from the start (use Alembic if Python, or equivalent)
- [ ] Implement `POST /provision` endpoint:
  - Accepts `{ user_id, app_id }` — looks up the app template in `app_catalog`
  - Resolves the pinned image digest for that app
  - Generates a Docker Compose file from the template, substituting: `user_id`, `image_digest`, `TZ` (from `users.timezone`), volume path, Traefik hostname (`{user_id}-{app_id}.almerno.app`)
  - Writes the compose file to `/opt/almerno/apps/{user_id}/{app_id}/docker-compose.yml`
  - Runs `docker compose up -d` via subprocess or Docker SDK
  - Waits for container health check to pass (timeout: 60 seconds — users should not wait longer than this)
  - Registers the install record in the database with `status = running` and the image digest
  - Returns `{ hostname, status }` to the caller
- [ ] Implement `POST /deprovision` endpoint:
  - Accepts `{ user_id, app_id }`
  - Runs `docker compose down` (stops and removes the container — does NOT delete the volume)
  - Archives the volume (move to cold storage path or mark as archived in DB)
  - Updates install record `status = deprovisioned`
  - Returns `{ status: "deprovisioned" }`
- [ ] Implement `GET /status/{user_id}/{app_id}` — returns current container status (running, stopped, error) by querying Docker directly, not just the database
- [ ] Implement `GET /installs/{user_id}` — returns all installs for a user with their statuses
- [ ] Add authentication to all endpoints (the control plane is internal-only; use a shared secret header or mTLS — it must not be publicly accessible)
- [ ] Write integration tests for provision → status → deprovision cycle using a real Docker daemon (not mocked)
- [ ] Validate: provision Vaultwarden for a test user ID, confirm it appears at `{user_id}-vaultwarden.almerno.app`, confirm deprovision removes it

---

## Phase 2 — App Catalog

**Goal:** Three fully specified, tested Docker Compose templates — one per MVP app. Each template enforces resource limits, health checks, correct volume paths, and environment variable schema. A new install of any app is deterministic and safe.

**Complexity:** Medium

**Prerequisites:**
- Phase 1 complete (templates are consumed by the control plane's provisioning logic)

**For each app, the template must define:**
- Pinned image digest (no `latest` tag — ever)
- Resource limits: CPU and memory caps to prevent noisy-neighbor impact
- Named volume pointed at the user's Hetzner Volume mount (Phase 3 wires this up; Phase 2 uses a local volume placeholder)
- `TZ` env var (value injected at provision time from user's timezone)
- Health check (HTTP endpoint or process check) so provisioning can wait for ready
- Restart policy: `unless-stopped`
- Network: isolated Docker network per user (prevents cross-user container communication)
- Traefik labels: hostname routing + TLS

**App 1 — Vaultwarden**

- Image: `vaultwarden/server` (pin to specific digest at implementation time)
- RAM limit: 256MB (typical usage ~50MB; limit leaves headroom without hogging)
- CPU limit: 0.5 cores
- Volume: `/data` — contains the SQLite database and attachments
- Health check: HTTP GET `/alive` → 200
- Env vars: `TZ`, `DOMAIN=https://{hostname}`, `WEBSOCKET_ENABLED=true`, `SIGNUPS_ALLOWED=false` (invites only — prevents unauthorized account creation on a user's instance)

**App 2 — Actual Budget**

- Image: `actualbudget/actual-server` (pin to specific digest at implementation time)
- RAM limit: 512MB
- CPU limit: 0.5 cores
- Volume: `/data` — contains SQLite budget files
- Health check: HTTP GET `/` → 200
- Env vars: `TZ`

**App 3 — Mealie**

- Image: `ghcr.io/mealie-recipes/mealie` (pin to specific digest at implementation time)
- RAM limit: 512MB
- CPU limit: 0.5 cores
- Volume: `/app/data` — contains SQLite database and recipe images
- Health check: HTTP GET `/api/app/about` → 200
- Env vars: `TZ`, `BASE_URL=https://{hostname}`, `ALLOW_SIGNUP=false`

**Steps:**

- [ ] Write the Jinja2 (or equivalent) template for each app's `docker-compose.yml`
- [ ] Document the variable schema each template accepts (so the control plane knows exactly what to inject)
- [ ] Record the pinned image digest for each app in the `app_catalog` table at initial seed time
- [ ] Test each template manually: render it, run `docker compose up -d`, verify the health check passes, verify resource limits are enforced (`docker stats`)
- [ ] Verify cross-user network isolation: two containers from different users cannot ping each other
- [ ] Validate: all three apps provision successfully via the control plane API

---

## Phase 3 — Storage & Backups

**Goal:** Each user's app data lives on a Hetzner Volume (block storage), not the VPS's local NVMe. Nightly Restic backups push to Hetzner Object Storage with 30-day retention. A restore from backup has been tested and confirmed to work before this phase is considered done.

**Complexity:** Medium

**Why this matters:** If the VPS dies and data is only on local NVMe, it's gone. Hetzner Volumes can be detached and reattached to a new node. Object Storage backups provide a second, independent copy at ~12x cheaper cost per GB.

**Prerequisites:**
- Phase 2 complete
- ❓ Hetzner Object Storage bucket created (`almerno-backups`)
- ❓ Hetzner Object Storage credentials (Access Key + Secret Key) stored as env vars on the VPS, never committed to code

**Steps:**

- [ ] Create a Hetzner Volume per user (via Hetzner API at provision time — add this call to the control plane's `POST /provision` logic)
  - Volume naming convention: `almerno-{user_id}-{app_id}`
  - Attach to the VPS and mount at `/opt/almerno/volumes/{user_id}/{app_id}/`
  - Store the volume path in the `installs` table
- [ ] Update Docker Compose templates to bind-mount the Hetzner Volume path instead of a named local volume
- [ ] Install Restic on the host
- [ ] Write a backup script (`/opt/almerno/scripts/backup.sh`):
  - Iterates over all active installs from the control plane database
  - For each install: pauses the container briefly (`docker pause`), runs `restic backup` of the volume path to the Hetzner Object Storage bucket, resumes the container (`docker unpause`)
  - Runs `restic forget --prune --keep-daily 30` to enforce 30-day retention
  - Logs success/failure per install
- [ ] Schedule the backup script as a cron job (runs nightly at 02:00 UTC)
- [ ] Write a restore script (`/opt/almerno/scripts/restore.sh`):
  - Accepts `user_id` and `app_id` as arguments
  - Stops the container, restores the latest Restic snapshot to the volume path, restarts the container
- [ ] **Restore test (mandatory before phase is done):**
  - [ ] Provision a test install of each of the 3 apps, populate with real data (create a vault entry, a budget entry, a recipe)
  - [ ] Run the backup script
  - [ ] Delete the volume contents to simulate data loss
  - [ ] Run the restore script
  - [ ] Verify the data is present and the app functions correctly after restore
- [ ] Validate: all three restore tests pass; backup logs show no errors

---

## Phase 4 — Product Shell

**Goal:** A minimal user-facing web UI that lets a real user sign up, see the three available apps, install one, monitor its status, and uninstall it. Not a polished product — just enough to close the provisioning loop from a real browser session.

**Complexity:** Medium

**Prerequisites:**
- Phase 1 complete (the UI calls the control plane API)
- ❓ Auth provider chosen (Clerk or Auth0 recommended — do not build auth from scratch at this stage)
- ❓ Domain routing decided: does the product UI live at `app.almerno.app`? Confirm before building.

**Scope — what's in:**
- Sign up / log in
- App catalog page: three cards (Vaultwarden, Actual Budget, Mealie), each with name, one-line description, and "Install" button
- Per-app status indicator: not installed / provisioning / running / error
- "Open" button when an app is running — links to `{user_id}-{app_id}.almerno.app`
- "Uninstall" button — calls `/deprovision`, removes the route

**Scope — what's explicitly out of Phase 4:**
- Payments / subscription management
- Email notifications
- App version management or update flows
- Settings or account management beyond what auth provides

**Steps:**

- [ ] Bootstrap a React frontend (Next.js recommended for easy Vercel deployment; or a separate SPA if preferred)
- [ ] Integrate chosen auth provider — protect all routes behind login
- [ ] At signup, capture the user's timezone (browser `Intl.DateTimeFormat().resolvedOptions().timeZone`) and store it against the user record — this is a first-class step, not optional
- [ ] Build the app catalog page:
  - [ ] Fetch available apps from `GET /catalog` (add this endpoint to the control plane)
  - [ ] Render a card per app with name, tagline, and install CTA
- [ ] Build install flow:
  - [ ] "Install" button calls `POST /provision` — show a loading state (target: resolves in <60s)
  - [ ] On success, show the "Open" button with the provisioned URL
- [ ] Build status polling: poll `GET /status/{user_id}/{app_id}` every 5 seconds while status is `provisioning`
- [ ] Build uninstall flow: confirm dialog → calls `POST /deprovision` → card returns to "not installed" state
- [ ] Deploy the frontend to Vercel (consistent with existing landing page setup)
- [ ] Validate: a real sign-up flow, end-to-end, from browser to running app, works without developer intervention

---

## Phase 5 — Validation

**Goal:** Confident that the full system works correctly under real conditions before any external users are onboarded. Every critical property — isolation, backups, TLS, resource limits — has been explicitly verified, not assumed.

**Complexity:** Low (mostly test execution and observation, not building)

**Prerequisites:** Phases 0–4 complete

**Checklist:**

**Provisioning:**
- [ ] Provision all three apps for the same test user — all three run simultaneously without conflict
- [ ] Provision the same app for two different test users — both instances run independently
- [ ] Time the provision flow end-to-end; confirm it completes in under 60 seconds for each app

**TLS:**
- [ ] All three app URLs (`{user_id}-{app_id}.almerno.app`) return valid HTTPS with no certificate warnings
- [ ] HTTP requests to those URLs redirect to HTTPS (not accessible in plain HTTP)
- [ ] Wildcard cert covers all subdomains (test at least 5 unique hostnames)

**Isolation:**
- [ ] `docker exec` into User A's Vaultwarden container; confirm it cannot ping or connect to User B's Vaultwarden container
- [ ] Confirm no shared volumes exist between any two users' containers

**Resource limits:**
- [ ] Under artificial load (use `stress` or similar inside a container), confirm CPU and memory are capped at the defined limits and do not starve neighboring containers
- [ ] Run all three apps simultaneously at load; confirm host remains stable

**Backups:**
- [ ] Run the backup script manually; confirm all three apps' data is present in Hetzner Object Storage
- [ ] For one app, perform a full restore (delete data, restore from backup, verify data intact) — this is a repeat of Phase 3's test but now against the production backup job, not the dev script

**Deprovision:**
- [ ] Deprovision each test app; confirm the Traefik route is gone (subdomain returns 404, not an exposed container)
- [ ] Confirm the volume data is archived (not deleted) and the Hetzner Volume still exists after deprovisioning
- [ ] Re-provision the same app for the same user; confirm previous data is restored from the archived volume

**Environment standardization:**
- [ ] `docker exec` into each running container and verify `TZ` env var matches the test user's configured timezone
- [ ] Verify no container inherits the host's environment variables (run `env` inside each container; the list should contain only what the compose file defines)
