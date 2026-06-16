"""初始化种子数据。"""

from database import get_connection, init_db
import crud
from schemas import StairsCreate

SEED_DATA: list[StairsCreate] = [
    StairsCreate(
        name="朝天门梯道",
        city="重庆",
        step_count=320,
        estimated_height=48.0,
        difficulty="困难",
        is_public=True,
        notes="长江与嘉陵江交汇处，经典城市台阶打卡点。",
    ),
    StairsCreate(
        name="十八梯",
        city="重庆",
        step_count=180,
        estimated_height=27.0,
        difficulty="中等",
        is_public=True,
        notes="老重庆风貌街区，阶梯串联上下半城。",
    ),
    StairsCreate(
        name="武康路阶梯",
        city="上海",
        step_count=96,
        estimated_height=14.4,
        difficulty="简单",
        is_public=True,
        notes="法租界区域，梧桐树下的文艺台阶。",
    ),
    StairsCreate(
        name="鼓浪屿钢琴博物馆台阶",
        city="厦门",
        step_count=150,
        estimated_height=22.5,
        difficulty="中等",
        is_public=False,
        notes="内部参观路线，需预约进入。",
    ),
    StairsCreate(
        name="宽窄巷子北口阶梯",
        city="成都",
        step_count=120,
        estimated_height=18.0,
        difficulty="简单",
        is_public=True,
        notes="连接宽窄巷子与周边街区的公共台阶。",
    ),
]


def seed_if_empty() -> None:
    """若表为空则写入种子数据。"""
    init_db()
    with get_connection() as conn:
        count = conn.execute("SELECT COUNT(*) AS c FROM stairs").fetchone()["c"]
        if count == 0:
            for item in SEED_DATA:
                crud.create_stairs(conn, item)
