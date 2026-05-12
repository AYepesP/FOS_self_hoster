import sqlite3
from contextlib import contextmanager
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "almerno.db"


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                user_id     TEXT      PRIMARY KEY,
                email       TEXT      UNIQUE NOT NULL,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS installs (
                id           INTEGER   PRIMARY KEY AUTOINCREMENT,
                user_id      TEXT      NOT NULL,
                app_id       TEXT      NOT NULL,
                image        TEXT      NOT NULL,
                container_id TEXT,
                host_port    INTEGER,
                status       TEXT      NOT NULL DEFAULT 'installing',
                installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_used    TIMESTAMP,
                UNIQUE (user_id, app_id),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            );
        """)


def create_user(user_id: str, email: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO users (user_id, email) VALUES (?, ?)",
            (user_id, email),
        )


def get_user(user_id: str) -> dict | None:
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE user_id = ?", (user_id,)
        ).fetchone()
        return dict(row) if row else None


def create_install(user_id: str, app_id: str, image: str) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO installs (user_id, app_id, image, status)
            VALUES (?, ?, ?, 'installing')
            """,
            (user_id, app_id, image),
        )


def update_install(
    user_id: str,
    app_id: str,
    container_id: str,
    host_port: int,
    status: str,
) -> None:
    with get_conn() as conn:
        conn.execute(
            """
            UPDATE installs
            SET container_id = ?, host_port = ?, status = ?
            WHERE user_id = ? AND app_id = ?
            """,
            (container_id, host_port, status, user_id, app_id),
        )


def get_installs(user_id: str) -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM installs WHERE user_id = ?", (user_id,)
        ).fetchall()
        return [dict(row) for row in rows]


def delete_install(user_id: str, app_id: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "DELETE FROM installs WHERE user_id = ? AND app_id = ?",
            (user_id, app_id),
        )
