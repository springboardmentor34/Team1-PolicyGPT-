from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.database import Policy, User
from app.schemas.policy import PolicyCreate, PolicyUpdate


def create_policy(db: Session, policy_in: PolicyCreate, uploader: User) -> Policy:
    new_policy = Policy(
        title=policy_in.title,
        description=policy_in.description,
        sector=policy_in.sector,
        ministry_or_department=policy_in.ministry_or_department,
        effective_date=policy_in.effective_date,
        status=policy_in.status,
        uploaded_by_id=uploader.id
    )
    db.add(new_policy)
    db.commit()
    db.refresh(new_policy)
    return new_policy


def get_policy_by_id(db: Session, policy_id: UUID) -> Optional[Policy]:
    return db.query(Policy).filter(Policy.id == policy_id).first()


def get_all_policies(db: Session, skip: int = 0, limit: int = 100) -> List[Policy]:
    return db.query(Policy).offset(skip).limit(limit).all()


def update_policy(db: Session, policy_id: UUID, policy_in: PolicyUpdate) -> Policy:
    policy = get_policy_by_id(db, policy_id)
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    for field, value in policy_in.dict(exclude_unset=True).items():
        setattr(policy, field, value)

    db.commit()
    db.refresh(policy)
    return policy
