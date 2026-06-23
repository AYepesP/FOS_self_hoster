import json
from dataclasses import dataclass
from pathlib import Path

CATALOG_PATH = Path(__file__).parent / "catalog.json"


VALID_PRIVACY_TIERS = {"e2e", "encrypted_at_rest", "partial", "none"}


@dataclass
class AppConfig:
    app_id: str
    display_name: str
    logo: str
    image: str
    internal_port: int
    data_path: str
    mem_limit: str
    cpu_quota: int
    privacy_tier: str
    privacy_note: str
    environment: dict[str, str]
    container_user: str | None = None


def load_catalog() -> dict[str, AppConfig]:
    with open(CATALOG_PATH) as f:
        raw = json.load(f)

    catalog = {}
    for app_id, entry in raw.items():
        tier = entry["privacy_tier"]
        if tier not in VALID_PRIVACY_TIERS:
            raise ValueError(f"App '{app_id}' has unknown privacy_tier '{tier}'. Valid: {VALID_PRIVACY_TIERS}")
        catalog[app_id] = AppConfig(
            app_id=app_id,
            display_name=entry["display_name"],
            logo=entry["logo"],
            image=entry["image"],
            internal_port=entry["internal_port"],
            data_path=entry["data_path"],
            mem_limit=entry["mem_limit"],
            cpu_quota=entry["cpu_quota"],
            privacy_tier=tier,
            privacy_note=entry["privacy_note"],
            environment=entry.get("environment", {}),
            container_user=entry.get("container_user"),
        )

    return catalog
