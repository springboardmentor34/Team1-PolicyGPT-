from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.database import Policy


def compare_policies(db: Session, policy_ids):

    policies = db.query(Policy).filter(
        Policy.id.in_(policy_ids)
    ).all()

    if not policies:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No policies found"
        )

    return policies