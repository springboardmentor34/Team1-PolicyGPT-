from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class UserBase(BaseModel):
    email: str
    full_name: str
    role: Optional[str] = "citizen"


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: UUID
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True