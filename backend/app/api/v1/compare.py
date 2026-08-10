from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Policy, Scheme, AuditLog, User
from app.schemas.schemas import PolicyOut, SchemeOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/compare", tags=["Policy & Scheme Comparison"])

class PolicyCompareRequest(BaseModel):
    policy_ids: List[int]

class SchemeCompareRequest(BaseModel):
    scheme_ids: List[int]

@router.get("/policies")
@router.post("/policies")
def compare_policies(
    policy_ids: Optional[List[int]] = Query(None),
    body: Optional[PolicyCompareRequest] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    target_ids = policy_ids or (body.policy_ids if body else [])
    if not target_ids or len(target_ids) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 policy IDs to compare")
    if len(target_ids) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 policies can be compared at once")

    policies = db.query(Policy).filter(Policy.id.in_(target_ids)).all()

    audit = AuditLog(
        user_id=current_user.id if current_user else None,
        action="POLICY_COMPARE",
        resource="COMPARISON_ENGINE",
        details=f"Compared policies: {target_ids}"
    )
    db.add(audit)
    db.commit()

    return {
        "compared_items": [PolicyOut.model_validate(p) for p in policies],
        "comparison_matrix": {
            "title": [p.title for p in policies],
            "code": [p.code for p in policies],
            "category": [p.category for p in policies],
            "ministry": [p.ministry for p in policies],
            "department": [p.department for p in policies],
            "state": [p.state for p in policies],
            "sector": [p.sector for p in policies],
            "status": [p.status for p in policies],
            "effective_date": [str(p.effective_date) if p.effective_date else "Not specified" for p in policies]
        }
    }

@router.get("/schemes")
@router.post("/schemes")
def compare_schemes(
    scheme_ids: Optional[List[int]] = Query(None),
    body: Optional[SchemeCompareRequest] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    target_ids = scheme_ids or (body.scheme_ids if body else [])
    if not target_ids or len(target_ids) < 2:
        raise HTTPException(status_code=400, detail="Provide at least 2 scheme IDs to compare")
    if len(target_ids) > 4:
        raise HTTPException(status_code=400, detail="Maximum 4 schemes can be compared at once")

    schemes = db.query(Scheme).filter(Scheme.id.in_(target_ids)).all()

    audit = AuditLog(
        user_id=current_user.id if current_user else None,
        action="SCHEME_COMPARE",
        resource="COMPARISON_ENGINE",
        details=f"Compared schemes: {target_ids}"
    )
    db.add(audit)
    db.commit()

    return {
        "compared_items": [SchemeOut.model_validate(s) for s in schemes],
        "comparison_matrix": {
            "name": [s.name for s in schemes],
            "code": [s.code for s in schemes],
            "category": [s.category for s in schemes],
            "benefits": [s.benefits for s in schemes],
            "financial_assistance": [s.financial_assistance or "Not specified" for s in schemes],
            "budget_allocated": [float(s.budget_allocated) if s.budget_allocated else 0.0 for s in schemes],
            "target_group": [s.target_group or "All Citizens" for s in schemes],
            "deadline": [str(s.deadline) if s.deadline else "Not specified" for s in schemes],
            "status": [s.status for s in schemes]
        }
    }

