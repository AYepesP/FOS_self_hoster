import subprocess
import hmac
import hashlib
from pathlib import Path

def derive_key(user_id: str, app_id: str, master_secret: str) -> str:
    return hmac.new(master_secret.encode(), f"{user_id}-{app_id}".encode(), hashlib.sha256).hexdigest()

def check_available() -> None:
    result = subprocess.run(["which", "gocryptfs"], capture_output=True)
    if result.returncode != 0:
        raise RuntimeError("gocryptfs is not installed. Run: sudo apt-get install -y gocryptfs")

def init_volume(encrypted_path: Path, password: str) -> None:
    encrypted_path.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        ["gocryptfs", "-init", "-quiet", str(encrypted_path)],
        input=f"{password}\n",
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"gocryptfs init failed: {result.stderr}")

def mount_volume(encrypted_path: Path, plaintext_path: Path, password: str) -> None:
    plaintext_path.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        ["gocryptfs", "-quiet", "-allow_other", str(encrypted_path), str(plaintext_path)],
        input=f"{password}\n",
        text=True,
        capture_output=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"gocryptfs mount failed: {result.stderr}")

def unmount_volume(plaintext_path: Path) -> None:
    result = subprocess.run(
        ["fusermount", "-u", str(plaintext_path)],
        capture_output=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"unmount failed: {result.stderr.decode()}")

def is_mounted(plaintext_path: Path) -> bool:
    with open("/proc/mounts") as f:
        return str(plaintext_path) in f.read()

def is_initialized(encrypted_path: Path) -> bool:
    return (encrypted_path / "gocryptfs.conf").exists()

