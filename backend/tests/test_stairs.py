"""台阶接口单元测试。

覆盖场景：
1. 不带参数获取列表返回全部台阶
2. 按城市筛选只返回对应城市台阶
3. 查询存在编号的详情返回完整字段
4. 查询不存在编号时返回 404 错误
"""

import pytest
from fastapi.testclient import TestClient


def test_get_stairs_list_returns_all_items(client: TestClient):
    """不带参数获取列表，返回全部台阶数据。"""
    response = client.get("/api/stairs")
    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 5

    for item in data:
        assert "id" in item
        assert "name" in item
        assert "city" in item
        assert "step_count" in item


def test_get_stairs_list_filter_by_city_returns_matching_items(client: TestClient):
    """按城市筛选，只返回对应城市的台阶。"""
    response = client.get("/api/stairs?city=重庆")
    assert response.status_code == 200
    data = response.json()

    assert isinstance(data, list)
    assert len(data) == 2

    for item in data:
        assert item["city"] == "重庆"

    names = [item["name"] for item in data]
    assert "朝天门梯道" in names
    assert "十八梯" in names


def test_get_stairs_detail_existing_id_returns_full_fields(client: TestClient):
    """查询存在编号的台阶详情，返回完整字段。"""
    list_response = client.get("/api/stairs")
    stairs_list = list_response.json()
    target = stairs_list[0]
    stairs_id = target["id"]

    response = client.get(f"/api/stairs/{stairs_id}")
    assert response.status_code == 200
    detail = response.json()

    assert detail["id"] == stairs_id
    assert detail["name"] == target["name"]
    assert detail["city"] == target["city"]

    expected_fields = [
        "id", "name", "city", "step_count", "estimated_height",
        "difficulty", "is_public", "notes", "longitude", "latitude"
    ]
    for field in expected_fields:
        assert field in detail, f"缺少字段: {field}"

    assert isinstance(detail["id"], int)
    assert isinstance(detail["step_count"], int)
    assert isinstance(detail["estimated_height"], float)
    assert isinstance(detail["is_public"], bool)
    assert detail["difficulty"] in {"简单", "中等", "困难"}


def test_get_stairs_detail_not_found_returns_404(client: TestClient):
    """查询不存在编号的台阶，返回 404 错误。"""
    response = client.get("/api/stairs/99999")
    assert response.status_code == 404

    data = response.json()
    assert "detail" in data
    assert "台阶打卡点不存在" in data["detail"]
