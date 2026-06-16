"""Pydantic 请求/响应模型。"""

from pydantic import BaseModel, Field


class StairsBase(BaseModel):
    """台阶打卡点公共字段。"""

    name: str = Field(..., min_length=1, description="名称")
    city: str = Field(..., min_length=1, description="城市")
    step_count: int = Field(..., ge=1, description="级数")
    estimated_height: float = Field(..., ge=0, description="预估高度（米）")
    is_public: bool = Field(default=True, description="是否公开")
    notes: str = Field(default="", description="备注")


class StairsCreate(StairsBase):
    """创建台阶打卡点。"""


class StairsUpdate(BaseModel):
    """更新台阶打卡点（全部可选）。"""

    name: str | None = Field(default=None, min_length=1)
    city: str | None = Field(default=None, min_length=1)
    step_count: int | None = Field(default=None, ge=1)
    estimated_height: float | None = Field(default=None, ge=0)
    is_public: bool | None = None
    notes: str | None = None


class StairsOut(StairsBase):
    """台阶打卡点响应。"""

    id: int

    model_config = {"from_attributes": True}
