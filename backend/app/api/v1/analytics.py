from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from app.core.database import get_db
from app.models.models import Policy, Scheme, User, AuditLog, Feedback, SearchHistory, Report
from app.api.deps import get_current_user, require_authenticated_user, require_roles

router = APIRouter(prefix="/analytics", tags=["Dashboard & Analytics Module"])

@router.get("/summary")
def get_global_analytics_summary(db: Session = Depends(get_db)):
    total_policies = db.query(Policy).count()
    published_policies = db.query(Policy).filter(func.lower(Policy.status).in_(["published", "approved"])).count()
    pending_policies = db.query(Policy).filter(func.lower(Policy.status).in_(["submitted", "pending approval", "under_review", "draft"])).count()
    
    total_schemes = db.query(Scheme).count()
    active_schemes = db.query(Scheme).filter(func.lower(Scheme.status) == "active").count()
    
    total_users = db.query(User).count()
    users_by_role = dict(
        db.query(User.role, func.count(User.id)).group_by(User.role).all()
    )

    policies_by_category = dict(
        db.query(Policy.category, func.count(Policy.id)).group_by(Policy.category).all()
    )

    schemes_by_category = dict(
        db.query(Scheme.category, func.count(Scheme.id)).group_by(Scheme.category).all()
    )

    recent_audits = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(5).all()

    return {
        "policies": {
            "total": total_policies,
            "published": published_policies,
            "pending": pending_policies,
            "by_category": policies_by_category
        },
        "schemes": {
            "total": total_schemes,
            "active": active_schemes,
            "by_category": schemes_by_category
        },
        "users": {
            "total": total_users,
            "by_role": users_by_role
        },
        "recent_audit_logs": [
            {
                "id": a.id,
                "action": a.action,
                "resource": a.resource,
                "details": a.details,
                "timestamp": str(a.timestamp)
            } for a in recent_audits
        ]
    }

@router.get("/overview")
def get_admin_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator"]))
):
    total_users = db.query(User).count()
    citizens_count = db.query(User).filter(User.role == "Citizen").count()
    officials_count = db.query(User).filter(User.role == "Government Official").count()
    researchers_count = db.query(User).filter(User.role == "Researcher").count()
    organizations_count = db.query(User).filter(User.role == "Organization").count()
    admins_count = db.query(User).filter(User.role == "Administrator").count()

    total_policies = db.query(Policy).count()
    published_policies = db.query(Policy).filter(func.lower(Policy.status).in_(["published", "approved"])).count()
    pending_policies = db.query(Policy).filter(func.lower(Policy.status).in_(["submitted", "pending approval", "under_review"])).count()
    rejected_policies = db.query(Policy).filter(func.lower(Policy.status) == "rejected").count()
    archived_policies = db.query(Policy).filter(func.lower(Policy.status) == "archived").count()

    total_schemes = db.query(Scheme).count()
    active_schemes = db.query(Scheme).filter(func.lower(Scheme.status) == "active").count()
    review_schemes = db.query(Scheme).filter(func.lower(Scheme.status) == "under review").count()

    total_searches = db.query(SearchHistory).count()
    total_eligibility_checks = db.query(AuditLog).filter(AuditLog.action == "ELIGIBILITY_CHECK").count()
    total_comparisons = db.query(AuditLog).filter(AuditLog.action.in_(["POLICY_COMPARE", "SCHEME_COMPARE"])).count()
    total_feedback = db.query(Feedback).count()
    open_feedback = db.query(Feedback).filter(func.upper(Feedback.status).in_(["OPEN", "IN_PROGRESS"])).count()

    return {
        "users": {
            "total": total_users,
            "citizens": citizens_count,
            "officials": officials_count,
            "researchers": researchers_count,
            "organizations": organizations_count,
            "admins": admins_count
        },
        "policies": {
            "total": total_policies,
            "published": published_policies,
            "pending": pending_policies,
            "rejected": rejected_policies,
            "archived": archived_policies
        },
        "schemes": {
            "total": total_schemes,
            "active": active_schemes,
            "under_review": review_schemes
        },
        "system_activity": {
            "searches": total_searches,
            "eligibility_checks": total_eligibility_checks,
            "comparisons": total_comparisons,
            "total_feedback": total_feedback,
            "open_feedback": open_feedback
        }
    }

@router.get("/users")
def get_user_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator"]))
):
    users_by_role = dict(db.query(User.role, func.count(User.id)).group_by(User.role).all())
    users_by_state = dict(db.query(User.state, func.count(User.id)).filter(User.state.isnot(None)).group_by(User.state).all())
    active_users = db.query(User).filter(User.is_active == True).count()
    disabled_users = db.query(User).filter(User.is_active == False).count()

    return {
        "total_users": db.query(User).count(),
        "by_role": users_by_role,
        "by_state": users_by_state,
        "active_users": active_users,
        "disabled_users": disabled_users
    }

@router.get("/policies")
def get_policy_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official", "Researcher"]))
):
    by_category = dict(db.query(Policy.category, func.count(Policy.id)).group_by(Policy.category).all())
    by_status = dict(db.query(Policy.status, func.count(Policy.id)).group_by(Policy.status).all())
    by_ministry = dict(db.query(Policy.ministry, func.count(Policy.id)).group_by(Policy.ministry).all())
    by_state = dict(db.query(Policy.state, func.count(Policy.id)).group_by(Policy.state).all())

    top_viewed = [
        {"id": p.id, "code": p.code, "title": p.title, "views": p.view_count, "category": p.category}
        for p in db.query(Policy).order_by(desc(Policy.view_count)).limit(5).all()
    ]

    return {
        "total": db.query(Policy).count(),
        "by_category": by_category,
        "by_status": by_status,
        "by_ministry": by_ministry,
        "by_state": by_state,
        "top_viewed": top_viewed
    }

@router.get("/schemes")
def get_scheme_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official", "Researcher", "Organization"]))
):
    by_category = dict(db.query(Scheme.category, func.count(Scheme.id)).group_by(Scheme.category).all())
    by_status = dict(db.query(Scheme.status, func.count(Scheme.id)).group_by(Scheme.status).all())
    total_budget = db.query(func.sum(Scheme.budget_allocated)).scalar() or 0.0

    return {
        "total": db.query(Scheme).count(),
        "active": db.query(Scheme).filter(func.lower(Scheme.status) == "active").count(),
        "by_category": by_category,
        "by_status": by_status,
        "total_budget_allocated": float(total_budget)
    }

@router.get("/departments")
def get_department_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official"]))
):
    # Group policies by department
    dept_policies = dict(db.query(Policy.department, func.count(Policy.id)).group_by(Policy.department).all())
    
    # Department list
    departments = list(set(list(dept_policies.keys()) + [
        u.department for u in db.query(User.department).filter(User.department.isnot(None)).all()
    ]))

    result = []
    for dept in departments:
        if not dept:
            continue
        p_count = db.query(Policy).filter(Policy.department.ilike(dept)).count()
        pub_p_count = db.query(Policy).filter(Policy.department.ilike(dept), func.lower(Policy.status).in_(["published", "approved"])).count()
        officials_count = db.query(User).filter(User.department.ilike(dept), User.role == "Government Official").count()
        
        result.append({
            "department": dept,
            "total_policies": p_count,
            "published_policies": pub_p_count,
            "officials_count": officials_count
        })

    return result

@router.get("/official")
def get_official_department_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Government Official", "Administrator"]))
):
    dept = current_user.department or "Department of Agriculture"
    
    my_policies = db.query(Policy).filter(
        or_(Policy.department.ilike(f"%{dept}%"), Policy.created_by_id == current_user.id)
    ).all()
    
    my_schemes = db.query(Scheme).join(Policy, isouter=True).filter(
        or_(Policy.department.ilike(f"%{dept}%"), Policy.created_by_id == current_user.id)
    ).all()

    published_p = sum(1 for p in my_policies if p.status in ["PUBLISHED", "Published"])
    pending_p = sum(1 for p in my_policies if p.status in ["SUBMITTED", "Pending Approval"])

    return {
        "department": dept,
        "official_name": current_user.full_name,
        "policies_count": len(my_policies),
        "published_policies": published_p,
        "pending_policies": pending_p,
        "schemes_count": len(my_schemes),
        "active_schemes": sum(1 for s in my_schemes if s.status == "Active"),
        "total_views": sum(p.view_count or 0 for p in my_policies)
    }

@router.get("/researcher")
def get_researcher_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Researcher", "Administrator"]))
):
    policy_category_dist = dict(db.query(Policy.category, func.count(Policy.id)).group_by(Policy.category).all())
    scheme_category_dist = dict(db.query(Scheme.category, func.count(Scheme.id)).group_by(Scheme.category).all())
    state_dist = dict(db.query(Policy.state, func.count(Policy.id)).group_by(Policy.state).all())
    ministry_dist = dict(db.query(Policy.ministry, func.count(Policy.id)).group_by(Policy.ministry).all())
    
    total_budget = db.query(func.sum(Scheme.budget_allocated)).scalar() or 0.0
    search_count = db.query(SearchHistory).count()
    eligibility_count = db.query(AuditLog).filter(AuditLog.action == "ELIGIBILITY_CHECK").count()
    compare_count = db.query(AuditLog).filter(AuditLog.action.in_(["POLICY_COMPARE", "SCHEME_COMPARE"])).count()

    return {
        "policy_categories": policy_category_dist,
        "scheme_categories": scheme_category_dist,
        "state_distribution": state_dist,
        "ministry_distribution": ministry_dist,
        "total_budget_evaluated": float(total_budget),
        "total_searches": search_count,
        "eligibility_evaluations": eligibility_count,
        "comparisons_generated": compare_count
    }

@router.get("/organization")
def get_organization_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Organization", "Administrator"]))
):
    biz_schemes = db.query(Scheme).filter(Scheme.category.in_(["Business Support", "Farmer Welfare", "Housing", "Employment Programs"])).all()
    biz_policies = db.query(Policy).filter(Policy.category.in_(["Finance", "Agriculture", "Employment", "Infrastructure"])).all()

    return {
        "relevant_schemes_count": len(biz_schemes),
        "relevant_policies_count": len(biz_policies),
        "total_budget_available": float(sum(s.budget_allocated or 0 for s in biz_schemes)),
        "active_schemes": [
            {"id": s.id, "name": s.name, "category": s.category, "target": s.target_group}
            for s in biz_schemes
        ]
    }

@router.get("/usage")
def get_usage_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator"]))
):
    total_searches = db.query(SearchHistory).count()
    recent_searches = [
        {"query": s.query_text, "results": s.results_count, "time": str(s.timestamp)}
        for s in db.query(SearchHistory).order_by(desc(SearchHistory.timestamp)).limit(10).all()
    ]

    top_searches_raw = db.query(SearchHistory.query_text, func.count(SearchHistory.id)).filter(SearchHistory.query_text.isnot(None)).group_by(SearchHistory.query_text).order_by(desc(func.count(SearchHistory.id))).limit(5).all()
    top_searches = [{"query": term, "count": cnt} for term, cnt in top_searches_raw]

    eligibility_checks = db.query(AuditLog).filter(AuditLog.action == "ELIGIBILITY_CHECK").count()
    comparisons = db.query(AuditLog).filter(AuditLog.action.in_(["POLICY_COMPARE", "SCHEME_COMPARE"])).count()
    reports_generated = db.query(Report).count()
    logins_count = db.query(AuditLog).filter(AuditLog.action == "USER_LOGIN").count()

    return {
        "total_searches": total_searches,
        "recent_searches": recent_searches,
        "top_search_terms": top_searches,
        "eligibility_check_count": eligibility_checks,
        "comparison_count": comparisons,
        "report_generation_count": reports_generated,
        "login_count": logins_count
    }

