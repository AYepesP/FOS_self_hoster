from encryption import derive_key, init_volume, mount_volume, unmount_volume, is_mounted, is_initialized
from docker_client import ensure_network, start_container, stop_container, get_container_status, remove_network_if_empty
from database import create_install, update_install, get_installs, delete_install, get_user
from apps.loader import load_catalog, AppConfig
import os
import re
from pathlib import Path
import time

_ID_PATTERN = re.compile(r"[a-zA-Z0-9][a-zA-Z0-9_-]{0,62}")


def _validate_id(value: str, name: str) -> None:
    if not isinstance(value, str) or not _ID_PATTERN.fullmatch(value):
        raise ValueError(f"Invalid {name}: must be 1-63 characters, start with alphanumeric, and contain only letters, digits, hyphens, or underscores")


def provision(user_id, app_id):
    _validate_id(user_id, "user_id")
    _validate_id(app_id, "app_id")
    # Validate user and app existence
    user = get_user(user_id)
    if not user:
        raise ValueError(f"User with ID {user_id} does not exist")
    
    app = load_catalog().get(app_id)
    if not app:
        raise ValueError(f"App with ID {app_id} does not exist")
    
    existing = next((i for i in get_installs(user_id) if i["app_id"] == app_id), None)
    if existing and existing["status"] == "running":
        raise ValueError(f"App {app_id} is already running for user {user_id}")

    master_secret = os.environ["MASTER_SECRET"]
    data_root = Path(os.environ["DATA_ROOT"])
    password = derive_key(user_id, app_id, master_secret)

    encrypted_path = data_root / user_id / app_id / "encrypted"
    plaintext_path = data_root / user_id / app_id / "plaintext"

    if not is_initialized(encrypted_path):
        init_volume(encrypted_path, password)

    if not is_mounted(plaintext_path):
        mount_volume(encrypted_path, plaintext_path, password)

    ensure_network(user_id)
    create_install(user_id, app_id, app.image)

    container_id, host_port = start_container(
        user_id=user_id,
        app_id=app_id,
        image=app.image,
        data_path=app.data_path,
        volume_path=str(plaintext_path),
        internal_port=app.internal_port,
        mem_limit=app.mem_limit,
        cpu_quota=app.cpu_quota,
        environment=app.environment,
    )

    container_name = f"almerno_{user_id}_{app_id}"
    deadline = time.time() + 60
    while time.time() < deadline:
        if get_container_status(container_name) == "running":
            break
        time.sleep(2)
    else:
        stop_container(container_name)
        unmount_volume(plaintext_path)
        delete_install(user_id, app_id)
        raise RuntimeError(f"Container for {app_id} did not become healthy within 60 seconds")

    update_install(user_id, app_id, container_id, host_port, "running")
    return {"host_port": host_port, "status": "running"}


def deprovision(user_id, app_id):
    _validate_id(user_id, "user_id")
    _validate_id(app_id, "app_id")

    user = get_user(user_id)
    if not user:
        raise ValueError(f"User {user_id} does not exist")

    install = next((i for i in get_installs(user_id) if i["app_id"] == app_id), None)
    if not install:
        raise ValueError(f"App {app_id} is not installed for user {user_id}")
    if install["status"] != "running":
        raise ValueError(f"App {app_id} is not running for user {user_id} (status: {install['status']})")

    data_root = Path(os.environ["DATA_ROOT"])
    master_secret = os.environ["MASTER_SECRET"]
    password = derive_key(user_id, app_id, master_secret)
    plaintext_path = data_root / user_id / app_id / "plaintext"

    if not is_mounted(plaintext_path):
        raise RuntimeError(f"Volume for {app_id} is not mounted — refusing to deprovision in inconsistent state")

    # Stop container first so it can flush writes, then pull the plaintext away
    container_name = f"almerno_{user_id}_{app_id}"
    stop_container(container_name)
    unmount_volume(plaintext_path)
    remove_network_if_empty(user_id)

    delete_install(user_id, app_id)
    return {"status": "deprovisioned"}