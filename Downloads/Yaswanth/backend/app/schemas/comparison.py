from typing import List
from uuid import UUID
from pydantic import BaseModel


class PolicyCompareRequest(BaseModel):
    policy_ids: List[UUID]


class PolicyCompareItem(BaseModel):
    id: UUID
    title: str
    description: str
    sector: str
    ministry_or_department: str
    status: str

    class Config:
        from_attributes = True


class PolicyCompareResponse(BaseModel):
    total: int
    policies: List[PolicyCompareItem]