"""SQLite 数据库连接与初始化。"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "stairs.db"


def get_connection() -> sqlite3.Connection:
    """
     * 获取 SQLite 连接，启用 Row 工厂便于按列名访问。
     * @returns {sqlite3.Connection}
     """
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """创建台阶打卡点表与打卡记录表（若不存在）。"""
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS stairs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                city TEXT NOT NULL,
                step_count INTEGER NOT NULL,
                estimated_height REAL NOT NULL,
                is_public INTEGER NOT NULL DEFAULT 1,
                notes TEXT DEFAULT ''
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS checkins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stairs_id INTEGER NOT NULL,
                checkin_time TEXT NOT NULL,
                duration_minutes INTEGER NOT NULL,
                feeling TEXT DEFAULT '',
                FOREIGN KEY (stairs_id) REFERENCES stairs(id)
            )
            """
        )
        conn.commit()
