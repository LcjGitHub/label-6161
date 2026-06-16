# 城市台阶打卡点

记录与浏览各城市台阶打卡点的 MVP 应用：列表（城市筛选）+ 详情，含基础 CRUD。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React + Chakra UI + React Hook Form + axios（端口 **3101**） |
| 后端 | FastAPI + SQLite `./data/stairs.db`（端口 **3000**） |

## 字段说明

- **名称**、**城市**、**级数**、**预估高度**（米）、**是否公开**、**备注**

## 启动方式

### 1. 后端（一条命令）

在项目根目录执行：

```bash
cd backend && python -m venv .venv && .venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload --port 3000
```

> macOS / Linux 将激活命令改为：`source .venv/bin/activate`

首次启动会自动创建 `data/stairs.db` 并写入 **5 条**种子数据。

API 文档：http://localhost:3000/docs

### 2. 前端

新开一个终端，在项目根目录执行：

```bash
cd frontend && npm install && npm run dev
```

浏览器访问：http://localhost:3101

## 目录结构

```
├── backend/          # FastAPI 后端
├── frontend/         # React 前端
├── data/             # SQLite 数据库（运行时生成）
└── README.md
```

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/stairs?city=` | 列表，可选城市筛选 |
| GET | `/api/cities` | 城市列表 |
| GET | `/api/stairs/{id}` | 详情 |
| POST | `/api/stairs` | 创建 |
| PUT | `/api/stairs/{id}` | 更新 |
| DELETE | `/api/stairs/{id}` | 删除 |

## 说明

- 依赖均安装在项目目录内（`backend/.venv`、`frontend/node_modules`），无需全局 pnpm/yarn。
- MVP 范围：列表 + 详情两页、基础 CRUD、5 条 seed；不含登录、JWT、Redis、Docker、MySQL/PostgreSQL。
