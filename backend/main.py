"""城市台阶打卡点 API。"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import crud
from database import get_connection, init_db
from schemas import StairsCreate, StairsOut, StairsUpdate, CheckinCreate, CheckinOut, StairsStats
from seed import seed_if_empty


@asynccontextmanager
async def lifespan(_: FastAPI):
    """应用启动时初始化数据库与种子数据。"""
    init_db()
    seed_if_empty()
    yield


app = FastAPI(title="城市台阶打卡点 API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3101", "http://127.0.0.1:3101"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/stairs", response_model=list[StairsOut])
def read_stairs(city: str | None = Query(default=None, description="按城市筛选")):
    """获取台阶列表。"""
    with get_connection() as conn:
        return crud.list_stairs(conn, city=city or None)


@app.get("/api/cities", response_model=list[str])
def read_cities():
    """获取城市列表（用于筛选）。"""
    with get_connection() as conn:
        return crud.list_cities(conn)


@app.get("/api/stairs/{stairs_id}", response_model=StairsOut)
def read_stairs_detail(stairs_id: int):
    """获取台阶详情。"""
    with get_connection() as conn:
        item = crud.get_stairs(conn, stairs_id)
    if not item:
        raise HTTPException(status_code=404, detail="台阶打卡点不存在")
    return item


@app.post("/api/stairs", response_model=StairsOut, status_code=201)
def create_stairs(data: StairsCreate):
    """创建台阶打卡点。"""
    with get_connection() as conn:
        return crud.create_stairs(conn, data)


@app.put("/api/stairs/{stairs_id}", response_model=StairsOut)
def update_stairs(stairs_id: int, data: StairsUpdate):
    """更新台阶打卡点。"""
    with get_connection() as conn:
        item = crud.update_stairs(conn, stairs_id, data)
    if not item:
        raise HTTPException(status_code=404, detail="台阶打卡点不存在")
    return item


@app.delete("/api/stairs/{stairs_id}", status_code=204)
def delete_stairs(stairs_id: int):
    """删除台阶打卡点。"""
    with get_connection() as conn:
        ok = crud.delete_stairs(conn, stairs_id)
    if not ok:
        raise HTTPException(status_code=404, detail="台阶打卡点不存在")


@app.get("/api/stairs/{stairs_id}/checkins", response_model=list[CheckinOut])
def read_checkins(stairs_id: int):
    """按台阶编号查询打卡记录列表。"""
    with get_connection() as conn:
        stairs = crud.get_stairs(conn, stairs_id)
    if not stairs:
        raise HTTPException(status_code=404, detail="台阶打卡点不存在")
    with get_connection() as conn:
        return crud.list_checkins(conn, stairs_id)


@app.post("/api/checkins", response_model=CheckinOut, status_code=201)
def create_checkin(data: CheckinCreate):
    """新增一条打卡记录。"""
    with get_connection() as conn:
        stairs = crud.get_stairs(conn, data.stairs_id)
    if not stairs:
        raise HTTPException(status_code=404, detail="关联台阶不存在")
    with get_connection() as conn:
        return crud.create_checkin(conn, data)


@app.get("/api/stats", response_model=StairsStats)
def read_stats():
    """获取台阶数据统计概览。"""
    with get_connection() as conn:
        return crud.get_stairs_stats(conn)
