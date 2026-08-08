from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.database import EligibilityRule
from app.schemas.eligibility import EligibilityCheckRequest


def check_eligibility(db: Session, request: EligibilityCheckRequest):

    rules = db.query(EligibilityRule).filter(
        EligibilityRule.scheme_id == request.scheme_id
    ).all()

    if not rules:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No eligibility rules found for this scheme"
        )

    for rule in rules:

        # Age check
        if rule.min_age and request.age < rule.min_age:
            continue

        if rule.max_age and request.age > rule.max_age:
            continue

        # Income check
        if rule.max_income and request.income > float(rule.max_income):
            continue

        # Gender check
        if rule.gender_requirement != "all":
            if rule.gender_requirement.lower() != request.gender.lower():
                continue

        # Caste check
        if rule.caste_category != "all":
            if rule.caste_category.lower() != request.caste_category.lower():
                continue

        # State check
        if rule.state_or_region != "all":
            if rule.state_or_region.lower() != request.state_or_region.lower():
                continue

        # Occupation check
        if rule.occupation_type != "all":
            if rule.occupation_type.lower() != request.occupation_type.lower():
                continue

        return {
            "scheme_id": request.scheme_id,
            "eligible": True,
            "reason": "All eligibility criteria matched"
        }

    return {
        "scheme_id": request.scheme_id,
        "eligible": False,
        "reason": "Eligibility criteria not matched"
    }