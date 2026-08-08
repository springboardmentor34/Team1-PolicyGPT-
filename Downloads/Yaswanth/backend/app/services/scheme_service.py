from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.database import Scheme, Policy
from app.schemas.scheme import SchemeCreate, SchemeUpdate


def create_scheme(db: Session, scheme_in: SchemeCreate) -> Scheme:
    policy = db.query(Policy).filter(Policy.id == scheme_in.policy_id).first()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated Policy not found")

    # Check scheme code uniqueness
    existing = db.query(Scheme).filter(Scheme.code == scheme_in.code).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Scheme code already exists")

    new_scheme = Scheme(
        policy_id=scheme_in.policy_id,
        title=scheme_in.title,
        code=scheme_in.code,
        summary=scheme_in.summary,
        benefits_summary=scheme_in.benefits_summary,
        budget_allocation=scheme_in.budget_allocation,
        status=scheme_in.status
    )
    db.add(new_scheme)
    db.commit()
    db.refresh(new_scheme)
    return new_scheme


def get_scheme_by_id(db: Session, scheme_id: UUID) -> Optional[Scheme]:
    return db.query(Scheme).filter(Scheme.id == scheme_id).first()


def get_all_schemes(db: Session, skip: int = 0, limit: int = 100) -> List[Scheme]:
    return db.query(Scheme).offset(skip).limit(limit).all()


def update_scheme(db: Session, scheme_id: UUID, scheme_in: SchemeUpdate) -> Scheme:
    scheme = get_scheme_by_id(db, scheme_id)
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")

    for field, value in scheme_in.dict(exclude_unset=True).items():
        setattr(scheme, field, value)

    db.commit()
    db.refresh(scheme)
    return scheme


def delete_scheme(db: Session, scheme_id: UUID) -> None:
    scheme = get_scheme_by_id(db, scheme_id)

    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found"
        )

    db.delete(scheme)
    db.commit()