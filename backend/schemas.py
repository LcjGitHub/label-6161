"""Pydantic 请求/响应模型。"""

from pydantic import BaseModel, Field, field_validator

ALLOWED_DIFFICULTIES = {"简单", "中等", "困难"}


class StairsBase(BaseModel):
    """台阶打卡点公共字段。"""

    name: str = Field(..., min_length=1, description="名称")
    city: str = Field(..., min_length=1, description="城市")
    step_count: int = Field(..., ge=1, description="级数")
    estimated_height: float = Field(..., ge=0, description="预估高度（米）")
    difficulty: str = Field(default="中等", description="难度等级：简单/中等/困难")
    is_public: bool = Field(default=True, description="是否公开")
    notes: str = Field(default="", description="备注")

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: str) -> str:
        if v not in ALLOWED_DIFFICULTIES:
            raise ValueError(f"难度必须是以下值之一：{', '.join(sorted(ALLOWED_DIFFICULTIES))}")
        return v


class StairsCreate(StairsBase):
    """创建台阶打卡点。"""


class StairsUpdate(BaseModel):
    """更新台阶打卡点（全部可选）。"""

    name: str | None = Field(default=None, min_length=1)
    city: str | None = Field(default=None, min_length=1)
    step_count: int | None = Field(default=None, ge=1)
    estimated_height: float | None = Field(default=None, ge=0)
    difficulty: str | None = None
    is_public: bool | None = None
    notes: str | None = None

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: str | None) -> str | None:
        if v is not None and v not in ALLOWED_DIFFICULTIES:
            raise ValueError(f"难度必须是以下值之一：{', '.join(sorted(ALLOWED_DIFFICULTIES))}")
        return v


class StairsOut(StairsBase):
    """台阶打卡点响应。"""

    id: int

    model_config = {"from_attributes": True}


class CheckinCreate(BaseModel):
    """创建打卡记录。"""

    stairs_id: int = Field(..., description="关联台阶编号")
    checkin_time: str = Field(..., description="打卡日期时间")
    duration_minutes: int = Field(..., ge=1, description="攀登耗时（分钟）")
    feeling: str = Field(default="", description="简要感受")


class CheckinOut(BaseModel):
    """打卡记录响应。"""

    id: int
    stairs_id: int
    checkin_time: str
    duration_minutes: int
    feeling: str

    model_config = {"from_attributes": True}


class CityStairsCount(BaseModel):
    """各城市台阶数量分布。"""

    city: str = Field(..., description="城市名称")
    count: int = Field(..., description="台阶数量")


class StairsStats(BaseModel):
    """台阶数据统计概览。"""

    total_count: int = Field(..., description="全部台阶总数")
    avg_step_count: float = Field(..., description="全部台阶级数平均值")
    total_estimated_height: float = Field(..., description="预估高度合计值（米）")
    city_distribution: list[CityStairsCount] = Field(..., description="各城市台阶数量分布")


class FavoriteCreate(BaseModel):
    """创建收藏记录。"""

    stairs_id: int = Field(..., description="关联台阶编号")


class FavoriteOut(BaseModel):
    """收藏记录响应。"""

    id: int
    stairs_id: int
    favorite_time: str

    model_config = {"from_attributes": True}


class FavoriteWithStairs(BaseModel):
    """带台阶详情的收藏记录。"""

    id: int
    stairs_id: int
    favorite_time: str
    stairs: StairsOut
