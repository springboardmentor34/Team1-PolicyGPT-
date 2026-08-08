from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.comparison import (
    PolicyCompareRequest,
    PolicyCompareResponse
)
from app.services.comparison_service import compare_policies


router = APIRouter(
    prefix="/comparison",
    tags=["Policy Comparison"]
)


@router.post(
    "/",
    response_model=PolicyCompareResponse
)
def compare(
    request: PolicyCompareRequest,
    db: Session = Depends(get_db)
):

    policies = compare_policies(
        db,
        request.policy_ids
    )

    return {
        "total": len(policies),
        "policies": policies
    }