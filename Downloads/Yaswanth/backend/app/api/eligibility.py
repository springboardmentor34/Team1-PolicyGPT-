from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.eligibility import (
    EligibilityCheckRequest,
    EligibilityCheckResponse
)
from app.services.eligibility_service import check_eligibility


router = APIRouter(
    prefix="/eligibility",
    tags=["Eligibility Checker"]
)


@router.post(
    "/check",
    response_model=EligibilityCheckResponse,
    summary="Check scheme eligibility"
)
def check_scheme_eligibility(
    request: EligibilityCheckRequest,
    db: Session = Depends(get_db)
):
    return check_eligibility(db, request)