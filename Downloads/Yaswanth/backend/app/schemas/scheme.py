from typing import Optional
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class SchemeBase(BaseModel):
    title: str
    code: str
    summary: str
    benefits_summary: str
    budget_allocation: Decimal = Decimal("0.00")
    status: str = "active"


class SchemeCreate(SchemeBase):
    policy_id: UUID


class SchemeUpdate(BaseModel):
    title: Optional[str] = None
    code: Optional[str] = None
    summary: Optional[str] = None
    benefits_summary: Optional[str] = None
    budget_allocation: Optional[Decimal] = None
    status: Optional[str] = None


class SchemeResponse(SchemeBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    policy_id: UUID
    created_at: datetime
    updated_at: datetime
