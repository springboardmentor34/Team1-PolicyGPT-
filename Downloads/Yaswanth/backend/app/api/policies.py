from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db, User
from app.schemas.policy import PolicyResponse, PolicyCreate, PolicyUpdate
from app.dependencies import get_current_user, require_roles
from app.services.policy_service import create_policy, get_policy_by_id, get_all_policies, update_policy

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.get(
    "/",
    response_model=List[PolicyResponse],
    summary="List policies",
    description="Returns list of all government policies."
)
def list_policies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_all_policies(db, skip=skip, limit=limit)


@router.post(
    "/",
    response_model=PolicyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create policy",
    description="Creates a new policy record (Requires policy_officer or admin role)."
)
def add_policy(
    policy_in: PolicyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["policy_officer", "admin"]))
):
    return create_policy(db, policy_in, uploader=current_user)


@router.get(
    "/{policy_id}",
    response_model=PolicyResponse,
    summary="Get policy by ID",
    description="Returns detailed information of a specific policy."
)
def get_policy(policy_id: UUID, db: Session = Depends(get_db)):
    policy = get_policy_by_id(db, policy_id)
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
    return policy
