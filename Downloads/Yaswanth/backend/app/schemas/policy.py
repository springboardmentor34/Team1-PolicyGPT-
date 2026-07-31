from typing import Optional
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class PolicyBase(BaseModel):
    title: str
    description: str
    sector: str
    ministry_or_department: str
    effective_date: date
    status: str = "active"


class PolicyCreate(PolicyBase):
    pass


class PolicyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    sector: Optional[str] = None
    ministry_or_department: Optional[str] = None
    effective_date: Optional[date] = None
    status: Optional[str] = None


class PolicyResponse(PolicyBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    uploaded_by_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
