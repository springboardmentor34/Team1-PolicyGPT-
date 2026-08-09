from typing import List
from app.models.models import Scheme, EligibilityRule
from app.schemas.schemas import EligibilityCheckInput, SchemeEligibilityResult, SchemeOut

def evaluate_scheme_eligibility(scheme: Scheme, rule: EligibilityRule, user_input: EligibilityCheckInput) -> SchemeEligibilityResult:
    reasons: List[str] = []
    missing_criteria: List[str] = []
    total_checks = 0
    passed_checks = 0

    # 1. Age Check
    total_checks += 1
    if rule.min_age <= user_input.age <= rule.max_age:
        passed_checks += 1
        reasons.append(f"Age {user_input.age} falls within allowed range ({rule.min_age}-{rule.max_age} years).")
    else:
        missing_criteria.append(f"Age {user_input.age} is outside eligible range ({rule.min_age}-{rule.max_age} years).")

    # 2. Gender Check
    total_checks += 1
    if rule.gender == "All" or rule.gender.lower() == user_input.gender.lower():
        passed_checks += 1
        reasons.append(f"Gender criteria met ({user_input.gender}).")
    else:
        missing_criteria.append(f"Scheme is restricted to {rule.gender} applicants.")

    # 3. Annual Income Check
    total_checks += 1
    if user_input.income_annual <= float(rule.max_income):
        passed_checks += 1
        reasons.append(f"Annual income ₹{user_input.income_annual:,.2f} is within ceiling of ₹{float(rule.max_income):,.2f}.")
    else:
        missing_criteria.append(f"Annual income ₹{user_input.income_annual:,.2f} exceeds ceiling limit of ₹{float(rule.max_income):,.2f}.")

    # 4. Occupation Check
    total_checks += 1
    rule_occ = (rule.occupation or "All").lower()
    user_occ = (user_input.occupation or "All").lower()
    if rule_occ == "all" or user_occ in rule_occ or rule_occ in user_occ:
        passed_checks += 1
        reasons.append(f"Occupation '{user_input.occupation}' matches target demographic.")
    else:
        missing_criteria.append(f"Scheme target occupation is '{rule.occupation}'.")

    # 5. Education Level Check
    total_checks += 1
    rule_edu = (rule.education_level or "All").lower()
    user_edu = (user_input.education_level or "All").lower()
    if rule_edu == "all" or user_edu in rule_edu or rule_edu in user_edu:
        passed_checks += 1
        reasons.append(f"Education level '{user_input.education_level}' satisfies criteria.")
    else:
        missing_criteria.append(f"Education requirement: '{rule.education_level}'.")

    # 6. Social Category Check
    total_checks += 1
    rule_cat = (rule.social_category or "All").lower()
    user_cat = (user_input.social_category or "General").lower()
    if rule_cat == "all" or user_cat in rule_cat or rule_cat in user_cat:
        passed_checks += 1
        reasons.append(f"Social category '{user_input.social_category}' eligible.")
    else:
        missing_criteria.append(f"Target social category: '{rule.social_category}'.")

    # 7. Disability Status Check
    total_checks += 1
    if not rule.disability_required or user_input.disability_status == rule.disability_required:
        passed_checks += 1
        reasons.append("Disability status criteria satisfied.")
    else:
        missing_criteria.append("Disability certificate required for this specific grant.")

    match_score = int((passed_checks / total_checks) * 100) if total_checks > 0 else 100
    is_eligible = len(missing_criteria) == 0

    guidance = (
        f"Ready to apply! Prepare your Aadhaar Card, Income Certificate, and relevant proof for {scheme.name}. Apply online at: {scheme.application_link or 'Official Government Portal'}."
        if is_eligible
        else f"Currently, you meet {match_score}% of the criteria. Review missing criteria above or check secondary benefits under {scheme.name}."
    )

    scheme_out = SchemeOut.model_validate(scheme)

    return SchemeEligibilityResult(
        scheme=scheme_out,
        match_score=match_score,
        is_eligible=is_eligible,
        reasons=reasons,
        missing_criteria=missing_criteria,
        application_guidance=guidance
    )
