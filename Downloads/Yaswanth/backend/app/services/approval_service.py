from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database import Policy


def create_approval(db: Session, request):

    policy = db.query(Policy).filter(
        Policy.id == request.policy_id
    ).first()

    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Policy not found"
        )

    # Temporary response (database table pending)
    return {
        "id": policy.id,
        "policy_id": policy.id,
        "status": "pending",
        "remarks": request.remarks
    }


def update_approval(db: Session, approval_id, request):

    return {
        "id": approval_id,
        "policy_id": approval_id,
        "status": request.status,
        "remarks": request.remarks
    }