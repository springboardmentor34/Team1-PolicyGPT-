from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.models import Policy, Scheme, User, AuditLog, Feedback, SearchHistory
from app.api.deps import get_current_user

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
