from uuid import UUID
from pydantic import BaseModel


class EligibilityCheckRequest(BaseModel):
    scheme_id: UUID
    age: int
    income: float
    gender: str = "all"
    caste_category: str = "all"
    state_or_region: str = "all"
    occupation_type: str = "all"


class EligibilityCheckResponse(BaseModel):
    scheme_id: UUID
    eligible: bool
    reason: str