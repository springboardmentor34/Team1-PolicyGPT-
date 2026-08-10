from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Policy, User, AuditLog
from app.schemas.schemas import PolicyCreate, PolicyUpdate, PolicyStatusUpdate, PolicyOut
from app.api.deps import get_current_user, require_authenticated_user, require_roles

router = APIRouter(prefix="/policies", tags=["Policy Management"])

@router.get("/", response_model=List[PolicyOut])
def get_policies(
    skip: int = 0,
    limit: int = 50,
    category: Optional[str] = None,
    state: Optional[str] = None,
    ministry: Optional[str] = None,
    department: Optional[str] = None,
    sector: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(Policy)
    if category:
        query = query.filter(Policy.category == category)
    if state:
        query = query.filter(Policy.state.ilike(f"%{state}%"))
    if ministry:
        query = query.filter(Policy.ministry.ilike(f"%{ministry}%"))
    if department:
        query = query.filter(Policy.department.ilike(f"%{department}%"))
    if sector:
        query = query.filter(Policy.sector.ilike(f"%{sector}%"))
    if status_filter:
        query = query.filter(Policy.status.ilike(status_filter))

    return query.order_by(Policy.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{policy_id}", response_model=PolicyOut)
def get_policy_by_id(policy_id: int, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    policy.view_count += 1
    db.commit()
    return policy

from app.services.notification_service import create_notification, notify_users_by_role, notify_users_by_roles

@router.post("/", response_model=PolicyOut, status_code=status.HTTP_201_CREATED)
def create_policy(
    policy_in: PolicyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official"]))
):
    existing = db.query(Policy).filter(Policy.code == policy_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Policy with this code already exists")

    # Status workflow: Admin creates as 'PUBLISHED', Official creates as 'SUBMITTED'
    initial_status = "PUBLISHED" if current_user.role == "Administrator" else "SUBMITTED"

    policy_data = policy_in.model_dump()
    policy_data["status"] = initial_status

    policy = Policy(
        **policy_data,
        created_by_id=current_user.id
    )
    if current_user.role == "Administrator":
        policy.approved_by_id = current_user.id

    db.add(policy)
    db.commit()
    db.refresh(policy)

    audit = AuditLog(
        user_id=current_user.id,
        action="POLICY_CREATE",
        resource="POLICY",
        details=f"Created policy {policy.code} - {policy.title} with status {initial_status}"
    )
    db.add(audit)

    # Event Notifications
    if initial_status == "SUBMITTED":
        notify_users_by_role(
            db, "Administrator",
            f"New Policy Submitted: {policy.code}",
            f"{current_user.full_name} ({current_user.department or 'Government Official'}) submitted '{policy.title}' for verification.",
            "Policy Alert"
        )
    elif initial_status == "PUBLISHED":
        notify_users_by_roles(
            db, ["Citizen", "Researcher", "Organization"],
            f"New Policy Published: {policy.code}",
            f"Official Government Policy '{policy.title}' under {policy.ministry} is now live.",
            "Policy Alert"
        )

    db.commit()

    return policy

@router.put("/{policy_id}", response_model=PolicyOut)
@router.patch("/{policy_id}", response_model=PolicyOut)
def update_policy(
    policy_id: int,
    policy_in: PolicyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official"]))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    update_data = policy_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(policy, field, value)

    db.commit()
    db.refresh(policy)

    audit = AuditLog(
        user_id=current_user.id,
        action="POLICY_UPDATE",
        resource="POLICY",
        details=f"Updated policy {policy.code}"
    )
    db.add(audit)

    if policy.created_by_id and policy.created_by_id != current_user.id:
        create_notification(
            db, policy.created_by_id,
            f"Policy Updated: {policy.code}",
            f"Policy '{policy.title}' was updated by {current_user.full_name}.",
            "Policy Alert"
        )

    db.commit()

    return policy

@router.post("/{policy_id}/status", response_model=PolicyOut)
def update_policy_workflow_status(
    policy_id: int,
    status_in: PolicyStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator"]))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    valid_statuses = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "PUBLISHED", "REJECTED", "ARCHIVED"]
    if status_in.status.upper() not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {valid_statuses}")

    policy.status = status_in.status.upper()
    if status_in.rejection_reason:
        policy.rejection_reason = status_in.rejection_reason

    if policy.status in ["APPROVED", "PUBLISHED"]:
        policy.approved_by_id = current_user.id

    db.commit()
    db.refresh(policy)

    audit = AuditLog(
        user_id=current_user.id,
        action=f"POLICY_{policy.status}",
        resource="POLICY",
        details=f"Policy {policy.code} status changed to {policy.status}"
    )
    db.add(audit)

    # Event Notifications
    if policy.created_by_id:
        msg = f"Your policy directive '{policy.title}' ({policy.code}) status is now {policy.status}."
        if policy.rejection_reason:
            msg += f" Rejection reason: {policy.rejection_reason}"
        create_notification(
            db, policy.created_by_id,
            f"Policy {policy.status.title()}: {policy.code}",
            msg,
            "Policy Alert"
        )

    if policy.status in ["APPROVED", "PUBLISHED"]:
        notify_users_by_roles(
            db, ["Citizen", "Researcher", "Organization"],
            f"Policy Directives Published: {policy.code}",
            f"Government Directive '{policy.title}' has been approved and published officially.",
            "Policy Alert"
        )

    db.commit()

    return policy


@router.delete("/{policy_id}")
def delete_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official"]))
):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    db.delete(policy)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="POLICY_DELETE",
        resource="POLICY",
        details=f"Deleted policy ID {policy_id}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Policy ID {policy_id} deleted."}
