from uuid import UUID
from pydantic import BaseModel
from datetime import datetime


class ApprovalCreateRequest(BaseModel):
    policy_id: UUID
    remarks: str | None = None


class ApprovalUpdateRequest(BaseModel):
    status: str
    remarks: str | None = None


class ApprovalResponse(BaseModel):
    id: UUID
    policy_id: UUID
    status: str
    remarks: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True