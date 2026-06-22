"""
End-to-end PoC test: provisions Vaultwarden for a test user, then tears it down.

Run from infra/poc/ with the venv active:
    python3 test_provision.py
"""

import sys
import os
from pathlib import Path

# Make control_plane modules importable via bare imports (e.g. "from encryption import ...")
sys.path.insert(0, str(Path(__file__).parent / "control_plane"))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

from database import init_db, create_user, get_user
from provisioner import provision, deprovision

USER_ID = "alice"
EMAIL   = "alice@example.com"
APP_ID  = "vaultwarden"


def main():
    print("\n=== Almerno PoC — end-to-end provisioning test ===\n")

    print("[1/4] Initialising database...")
    init_db()
    print("      Done.")

    print(f"[2/4] Creating test user '{USER_ID}'...")
    if get_user(USER_ID):
        print("      User already exists — skipping.")
    else:
        create_user(USER_ID, EMAIL)
        print("      Done.")

    print(f"[3/4] Provisioning '{APP_ID}' (this pulls the Docker image if needed — may take a minute)...")
    result = provision(USER_ID, APP_ID)
    port = result["host_port"]
    print(f"      Done. Container is running.")
    print(f"\n*** Open in your browser: http://localhost:{port} ***\n")

    input("Press ENTER to deprovision and clean up...")

    print(f"[4/4] Deprovisioning '{APP_ID}'...")
    deprovision(USER_ID, APP_ID)
    print("      Done. Container stopped, volume unmounted, DB record removed.")
    print("\n=== Test complete ===\n")


if __name__ == "__main__":
    main()
