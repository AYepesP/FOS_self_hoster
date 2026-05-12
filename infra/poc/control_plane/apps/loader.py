import json
from dataclasses import dataclass
from pathlib import Path

CATALOG_PATH = Path(__file__).parent / "catalog.json"


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
    environment: dict[str, str]


def load_catalog() -> dict[str, AppConfig]:
    with open(CATALOG_PATH) as f:
        raw = json.load(f)

    catalog = {}
    for app_id, entry in raw.items():
        catalog[app_id] = AppConfig(
            app_id=app_id,
            display_name=entry["display_name"],
            logo=entry["logo"],
            image=entry["image"],
            internal_port=entry["internal_port"],
            data_path=entry["data_path"],
            mem_limit=entry["mem_limit"],
            cpu_quota=entry["cpu_quota"],
            environment=entry.get("environment", {}),
        )

    return catalog
