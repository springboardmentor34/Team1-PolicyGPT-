from typing import List, Optional, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.models import Policy, Scheme, SearchHistory, User
from app.schemas.schemas import PolicyOut, SchemeOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/search", tags=["Intelligent Policy Search"])

@router.get("/")
def search_policies_and_schemes(
    q: Optional[str] = Query(None, description="Keyword search in title, description, code, ministry"),
    category: Optional[str] = None,
    state: Optional[str] = None,
    ministry: Optional[str] = None,
    department: Optional[str] = None,
    sector: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    # Query Policies
    policy_query = db.query(Policy)
    if q:
        search_pattern = f"%{q}%"
        policy_query = policy_query.filter(
            or_(
                Policy.title.ilike(search_pattern),
                Policy.description.ilike(search_pattern),
                Policy.code.ilike(search_pattern),
                Policy.ministry.ilike(search_pattern),
                Policy.department.ilike(search_pattern),
                Policy.summary.ilike(search_pattern)
            )
        )
    if category:
        policy_query = policy_query.filter(Policy.category == category)
    if state:
        policy_query = policy_query.filter(Policy.state.ilike(f"%{state}%"))
    if ministry:
        policy_query = policy_query.filter(Policy.ministry.ilike(f"%{ministry}%"))
    if department:
        policy_query = policy_query.filter(Policy.department.ilike(f"%{department}%"))
    if sector:
        policy_query = policy_query.filter(Policy.sector.ilike(f"%{sector}%"))
    if status_filter:
        policy_query = policy_query.filter(Policy.status == status_filter)

    policies = policy_query.order_by(Policy.created_at.desc()).all()

    # Query Schemes
    scheme_query = db.query(Scheme)
    if q:
        search_pattern = f"%{q}%"
        scheme_query = scheme_query.filter(
            or_(
                Scheme.name.ilike(search_pattern),
                Scheme.description.ilike(search_pattern),
                Scheme.code.ilike(search_pattern),
                Scheme.benefits.ilike(search_pattern),
                Scheme.target_group.ilike(search_pattern)
            )
        )
    if category:
        scheme_query = scheme_query.filter(Scheme.category == category)
    if status_filter:
        scheme_query = scheme_query.filter(Scheme.status == status_filter)

    schemes = scheme_query.order_by(Scheme.created_at.desc()).all()

    # Save Search History if logged in
    if current_user and (q or category or state or ministry):
        history = SearchHistory(
            user_id=current_user.id,
            query_text=q,
            filters_json={"category": category, "state": state, "ministry": ministry, "department": department, "sector": sector},
            results_count=len(policies) + len(schemes)
        )
        db.add(history)
        db.commit()

    return {
        "query": q,
        "filters": {
            "category": category,
            "state": state,
            "ministry": ministry,
            "department": department,
            "sector": sector,
            "status": status_filter
        },
        "total_results": len(policies) + len(schemes),
        "policies": [PolicyOut.model_validate(p) for p in policies],
        "schemes": [SchemeOut.model_validate(s) for s in schemes]
    }
