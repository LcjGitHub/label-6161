"""台阶打卡点 CRUD 操作。"""

import sqlite3

from schemas import StairsCreate, StairsUpdate, CheckinCreate


def _row_to_dict(row: sqlite3.Row) -> dict:
    """将数据库行转为 API 字典。"""
    return {
        "id": row["id"],
        "name": row["name"],
        "city": row["city"],
        "step_count": row["step_count"],
        "estimated_height": row["estimated_height"],
        "is_public": bool(row["is_public"]),
        "notes": row["notes"] or "",
    }


def list_stairs(conn: sqlite3.Connection, city: str | None = None) -> list[dict]:
    """
     * 查询台阶列表，可按城市筛选。
     * @param {sqlite3.Connection} conn
     * @param {str | None} city
     * @returns {list[dict]}
     """
    if city:
        rows = conn.execute(
            "SELECT * FROM stairs WHERE city = ? ORDER BY id",
            (city,),
        ).fetchall()
    else:
        rows = conn.execute("SELECT * FROM stairs ORDER BY id").fetchall()
    return [_row_to_dict(r) for r in rows]


def get_stairs(conn: sqlite3.Connection, stairs_id: int) -> dict | None:
    """按 ID 获取单条记录。"""
    row = conn.execute(
        "SELECT * FROM stairs WHERE id = ?",
        (stairs_id,),
    ).fetchone()
    return _row_to_dict(row) if row else None


def create_stairs(conn: sqlite3.Connection, data: StairsCreate) -> dict:
    """创建台阶打卡点。"""
    cursor = conn.execute(
        """
        INSERT INTO stairs (name, city, step_count, estimated_height, is_public, notes)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            data.name,
            data.city,
            data.step_count,
            data.estimated_height,
            int(data.is_public),
            data.notes,
        ),
    )
    conn.commit()
    return get_stairs(conn, cursor.lastrowid)  # type: ignore[arg-type]


def update_stairs(
    conn: sqlite3.Connection, stairs_id: int, data: StairsUpdate
) -> dict | None:
    """更新台阶打卡点。"""
    existing = get_stairs(conn, stairs_id)
    if not existing:
        return None

    payload = data.model_dump(exclude_unset=True)
    if not payload:
        return existing

    merged = {**existing, **payload}
    if "is_public" in merged:
        merged["is_public"] = int(merged["is_public"])

    conn.execute(
        """
        UPDATE stairs
        SET name = ?, city = ?, step_count = ?, estimated_height = ?,
            is_public = ?, notes = ?
        WHERE id = ?
        """,
        (
            merged["name"],
            merged["city"],
            merged["step_count"],
            merged["estimated_height"],
            merged["is_public"],
            merged["notes"],
            stairs_id,
        ),
    )
    conn.commit()
    return get_stairs(conn, stairs_id)


def delete_stairs(conn: sqlite3.Connection, stairs_id: int) -> bool:
    """删除台阶打卡点及其下全部打卡记录。"""
    conn.execute("DELETE FROM checkins WHERE stairs_id = ?", (stairs_id,))
    cursor = conn.execute("DELETE FROM stairs WHERE id = ?", (stairs_id,))
    conn.commit()
    return cursor.rowcount > 0


def list_cities(conn: sqlite3.Connection) -> list[str]:
    """获取所有不重复城市列表。"""
    rows = conn.execute(
        "SELECT DISTINCT city FROM stairs ORDER BY city"
    ).fetchall()
    return [r["city"] for r in rows]


def _checkin_row_to_dict(row: sqlite3.Row) -> dict:
    """将打卡记录行转为 API 字典。"""
    return {
        "id": row["id"],
        "stairs_id": row["stairs_id"],
        "checkin_time": row["checkin_time"],
        "duration_minutes": row["duration_minutes"],
        "feeling": row["feeling"] or "",
    }


def list_checkins(conn: sqlite3.Connection, stairs_id: int) -> list[dict]:
    """按台阶编号查询打卡记录列表。"""
    rows = conn.execute(
        "SELECT * FROM checkins WHERE stairs_id = ? ORDER BY checkin_time DESC",
        (stairs_id,),
    ).fetchall()
    return [_checkin_row_to_dict(r) for r in rows]


def create_checkin(conn: sqlite3.Connection, data: CheckinCreate) -> dict:
    """新增一条打卡记录。"""
    cursor = conn.execute(
        """
        INSERT INTO checkins (stairs_id, checkin_time, duration_minutes, feeling)
        VALUES (?, ?, ?, ?)
        """,
        (
            data.stairs_id,
            data.checkin_time,
            data.duration_minutes,
            data.feeling,
        ),
    )
    conn.commit()
    row = conn.execute(
        "SELECT * FROM checkins WHERE id = ?",
        (cursor.lastrowid,),
    ).fetchone()
    return _checkin_row_to_dict(row)
