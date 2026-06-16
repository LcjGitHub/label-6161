"""pytest 配置与共享 fixture。"""

import os
import sys
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import database
import seed
import main


@pytest.fixture(autouse=True)
def setup_test_db():
    """每个测试前初始化临时数据库并加载种子数据，测试后清理。"""
    tmp_dir = tempfile.mkdtemp(prefix="stairs_test_")
    test_db_path = Path(tmp_dir) / "test_stairs.db"

    original_db_path = database.DB_PATH
    database.DB_PATH = test_db_path

    database.init_db()
    seed.seed_if_empty()

    yield

    database.DB_PATH = original_db_path

    try:
        if test_db_path.exists():
            test_db_path.unlink(missing_ok=True)
    except (PermissionError, OSError):
        pass


@pytest.fixture
def client():
    """返回 FastAPI TestClient 实例。"""
    return TestClient(main.app)
