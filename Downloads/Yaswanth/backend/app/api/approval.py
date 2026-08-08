from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.approval import (
    ApprovalCreateRequest,
    ApprovalUpdateRequest,
    ApprovalResponse
)
from app.services.approval_service import (
    create_approval,
    update_approval
)


router = APIRouter(
    prefix="/approval",
    tags=["Approval Workflow"]
)


@router.post(
    "/",
    response_model=ApprovalResponse
)
def submit_for_approval(
    request: ApprovalCreateRequest,
    db: Session = Depends(get_db)
):
    return create_approval(db, request)


@router.put(
    "/{approval_id}",
    response_model=ApprovalResponse
)
def approve_policy(
    approval_id: UUID,
    request: ApprovalUpdateRequest,
    db: Session = Depends(get_db)
):
    return update_approval(db, approval_id, request)