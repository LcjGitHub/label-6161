"""后端 API 接口测试。"""

import os
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

os.environ["TEST_MODE"] = "1"

import database
import seed
import main

client = TestClient(main.app)


@pytest.fixture(autouse=True)
def setup_test_db():
    """每个测试前初始化一个临时数据库并加载种子数据。"""
    tmp_dir = tempfile.mkdtemp()
    test_db_path = Path(tmp_dir) / "test_stairs.db"
    database.DB_PATH = test_db_path
    database.init_db()
    seed.seed_if_empty()
    yield
    try:
        if test_db_path.exists():
            test_db_path.unlink(missing_ok=True)
    except (PermissionError, OSError):
        pass


def test_get_stairs_list():
    """测试获取台阶列表接口。"""
    response = client.get("/api/stairs")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5


def test_get_stairs_list_with_city_filter():
    """测试按城市筛选台阶列表。"""
    response = client.get("/api/stairs?city=重庆")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all(item["city"] == "重庆" for item in data)


def test_get_stairs_list_with_invalid_difficulty():
    """测试使用无效难度参数时返回 400。"""
    response = client.get("/api/stairs?difficulty=超级难")
    assert response.status_code == 400


def test_get_cities():
    """测试获取城市列表接口。"""
    response = client.get("/api/cities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert "重庆" in data


def test_get_stairs_detail():
    """测试获取台阶详情接口。"""
    list_response = client.get("/api/stairs")
    stairs_list = list_response.json()
    stairs_id = stairs_list[0]["id"]

    response = client.get(f"/api/stairs/{stairs_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == stairs_id
    assert "name" in data
    assert "city" in data
    assert "step_count" in data


def test_get_stairs_detail_not_found():
    """测试获取不存在的台阶详情返回 404。"""
    response = client.get("/api/stairs/99999")
    assert response.status_code == 404


def test_create_stairs():
    """测试创建台阶打卡点接口。"""
    payload = {
        "name": "测试台阶",
        "city": "北京",
        "step_count": 100,
        "estimated_height": 15.0,
        "difficulty": "简单",
        "is_public": True,
        "notes": "测试用",
    }
    response = client.post("/api/stairs", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == payload["name"]
    assert data["city"] == payload["city"]
    assert data["step_count"] == payload["step_count"]


def test_create_stairs_invalid_difficulty():
    """测试创建台阶时使用无效难度返回 422。"""
    payload = {
        "name": "测试台阶",
        "city": "北京",
        "step_count": 100,
        "estimated_height": 15.0,
        "difficulty": "无效难度",
        "is_public": True,
    }
    response = client.post("/api/stairs", json=payload)
    assert response.status_code == 422


def test_update_stairs():
    """测试更新台阶打卡点接口。"""
    list_response = client.get("/api/stairs")
    stairs_list = list_response.json()
    stairs_id = stairs_list[0]["id"]

    update_payload = {"notes": "更新后的备注"}
    response = client.put(f"/api/stairs/{stairs_id}", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["notes"] == update_payload["notes"]


def test_update_stairs_not_found():
    """测试更新不存在的台阶返回 404。"""
    response = client.put("/api/stairs/99999", json={"notes": "test"})
    assert response.status_code == 404


def test_delete_stairs():
    """测试删除台阶打卡点接口。"""
    create_payload = {
        "name": "待删除台阶",
        "city": "上海",
        "step_count": 50,
        "estimated_height": 7.5,
        "difficulty": "简单",
        "is_public": True,
    }
    create_response = client.post("/api/stairs", json=create_payload)
    stairs_id = create_response.json()["id"]

    response = client.delete(f"/api/stairs/{stairs_id}")
    assert response.status_code == 204

    get_response = client.get(f"/api/stairs/{stairs_id}")
    assert get_response.status_code == 404


def test_delete_stairs_not_found():
    """测试删除不存在的台阶返回 404。"""
    response = client.delete("/api/stairs/99999")
    assert response.status_code == 404


def test_get_stats():
    """测试获取统计概览接口。"""
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_count" in data
    assert "avg_step_count" in data
    assert "total_estimated_height" in data
    assert "city_distribution" in data
    assert isinstance(data["city_distribution"], list)
    assert data["total_count"] >= 5


def test_favorites_flow():
    """测试收藏相关接口的完整流程。"""
    list_response = client.get("/api/stairs")
    stairs_list = list_response.json()
    stairs_id = stairs_list[0]["id"]

    fav_response = client.post("/api/favorites", json={"stairs_id": stairs_id})
    assert fav_response.status_code == 201

    list_fav_response = client.get("/api/favorites")
    assert list_fav_response.status_code == 200
    fav_data = list_fav_response.json()
    assert any(f["stairs_id"] == stairs_id for f in fav_data)

    del_fav_response = client.delete(f"/api/favorites/{stairs_id}")
    assert del_fav_response.status_code == 204

    list_fav_response2 = client.get("/api/favorites")
    fav_data2 = list_fav_response2.json()
    assert not any(f["stairs_id"] == stairs_id for f in fav_data2)


def test_create_duplicate_favorite():
    """测试重复收藏同一台阶返回 400。"""
    list_response = client.get("/api/stairs")
    stairs_list = list_response.json()
    stairs_id = stairs_list[0]["id"]

    client.post("/api/favorites", json={"stairs_id": stairs_id})
    response = client.post("/api/favorites", json={"stairs_id": stairs_id})
    assert response.status_code == 400


def test_checkins_flow():
    """测试打卡记录相关接口。"""
    list_response = client.get("/api/stairs")
    stairs_list = list_response.json()
    stairs_id = stairs_list[0]["id"]

    checkin_payload = {
        "stairs_id": stairs_id,
        "checkin_time": "2024-01-15 10:30:00",
        "duration_minutes": 30,
        "feeling": "良好",
    }
    response = client.post("/api/checkins", json=checkin_payload)
    assert response.status_code == 201

    list_response = client.get(f"/api/stairs/{stairs_id}/checkins")
    assert list_response.status_code == 200
    checkins = list_response.json()
    assert len(checkins) >= 1

    summary_response = client.get(f"/api/stairs/{stairs_id}/checkin-summary")
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert summary["total_checkins"] >= 1
    assert summary["last_checkin_time"] is not None
