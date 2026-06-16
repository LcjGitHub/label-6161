"""SQLite 数据库连接与初始化。"""

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "data" / "stairs.db"

SEED_DIFFICULTY_MAP = {
    "朝天门梯道": "困难",
    "十八梯": "中等",
    "武康路阶梯": "简单",
    "鼓浪屿钢琴博物馆台阶": "中等",
    "宽窄巷子北口阶梯": "简单",
}

SEED_COORDINATES_MAP = {
    "朝天门梯道": (106.5828, 29.5628),
    "十八梯": (106.5774, 29.5534),
    "武康路阶梯": (121.4404, 31.2045),
    "鼓浪屿钢琴博物馆台阶": (118.0687, 24.4487),
    "宽窄巷子北口阶梯": (104.0554, 30.6698),
}


def get_connection() -> sqlite3.Connection:
    """
     * 获取 SQLite 连接，启用 Row 工厂便于按列名访问。
     * @returns {sqlite3.Connection}
     """
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _migrate_seed_difficulties(conn: sqlite3.Connection) -> None:
    """为已有的种子数据记录补充难度值。"""
    for name, difficulty in SEED_DIFFICULTY_MAP.items():
        conn.execute(
            "UPDATE stairs SET difficulty = ? WHERE name = ? AND difficulty = '中等'",
            (difficulty, name),
        )


def _migrate_seed_coordinates(conn: sqlite3.Connection) -> None:
    """为已有的种子数据记录补充经纬度值。"""
    for name, (longitude, latitude) in SEED_COORDINATES_MAP.items():
        conn.execute(
            "UPDATE stairs SET longitude = ?, latitude = ? WHERE name = ? AND longitude IS NULL AND latitude IS NULL",
            (longitude, latitude, name),
        )


def init_db() -> None:
    """创建台阶打卡点表、打卡记录表与收藏表（若不存在）。"""
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS stairs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                city TEXT NOT NULL,
                step_count INTEGER NOT NULL,
                estimated_height REAL NOT NULL,
                difficulty TEXT NOT NULL DEFAULT '中等',
                is_public INTEGER NOT NULL DEFAULT 1,
                notes TEXT DEFAULT '',
                longitude REAL DEFAULT NULL,
                latitude REAL DEFAULT NULL
            )
            """
        )
        try:
            conn.execute("ALTER TABLE stairs ADD COLUMN difficulty TEXT NOT NULL DEFAULT '中等'")
        except sqlite3.OperationalError:
            pass
        try:
            conn.execute("ALTER TABLE stairs ADD COLUMN longitude REAL DEFAULT NULL")
        except sqlite3.OperationalError:
            pass
        try:
            conn.execute("ALTER TABLE stairs ADD COLUMN latitude REAL DEFAULT NULL")
        except sqlite3.OperationalError:
            pass
        _migrate_seed_difficulties(conn)
        _migrate_seed_coordinates(conn)
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
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stairs_id INTEGER NOT NULL UNIQUE,
                favorite_time TEXT NOT NULL,
                FOREIGN KEY (stairs_id) REFERENCES stairs(id)
            )
            """
        )
        conn.commit()
