from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import Scheme, EligibilityRule, AuditLog, User
from app.schemas.schemas import EligibilityCheckInput, SchemeEligibilityResult
from app.services.eligibility_service import evaluate_scheme_eligibility
from app.api.deps import get_current_user

router = APIRouter(prefix="/eligibility", tags=["Eligibility Checker"])

@router.post("/check", response_model=List[SchemeEligibilityResult])
def check_scheme_eligibility(
    input_data: EligibilityCheckInput,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    query = db.query(Scheme).filter(
        (func.lower(Scheme.status) == "active") | (func.lower(Scheme.status) == "published")
    )
    if input_data.category and input_data.category.strip().lower() not in ["all", "all categories", ""]:
        query = query.filter(func.lower(Scheme.category) == input_data.category.strip().lower())

    schemes = query.all()
    
    results: List[SchemeEligibilityResult] = []

    for s in schemes:
        rule = db.query(EligibilityRule).filter(EligibilityRule.scheme_id == s.id).first()
        if not rule:
            rule = EligibilityRule(scheme_id=s.id)
        
        result = evaluate_scheme_eligibility(s, rule, input_data)
        results.append(result)

    results.sort(key=lambda x: x.match_score, reverse=True)

    audit = AuditLog(
        user_id=current_user.id if current_user else None,
        action="ELIGIBILITY_CHECK",
        resource="ELIGIBILITY_ENGINE",
        details=f"Evaluated eligibility for age {input_data.age}, occupation {input_data.occupation}, income {input_data.income_annual}"
    )
    db.add(audit)
    db.commit()

    return results

