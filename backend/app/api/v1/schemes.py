from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Scheme, EligibilityRule, User, AuditLog
from app.schemas.schemas import SchemeCreate, SchemeOut, EligibilityRuleBase, SchemeUpdate
from app.api.deps import require_roles

router = APIRouter(prefix="/schemes", tags=["Public Scheme Management"])

@router.get("/", response_model=List[SchemeOut])
def get_schemes(
    category: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    query = db.query(Scheme)
    if category:
        query = query.filter(Scheme.category == category)
    if status_filter:
        query = query.filter(Scheme.status == status_filter)
    
    return query.order_by(Scheme.created_at.desc()).all()

@router.get("/{scheme_id}", response_model=SchemeOut)
def get_scheme_by_id(scheme_id: int, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme

from app.services.notification_service import create_notification, notify_users_by_roles

@router.post("/", response_model=SchemeOut, status_code=status.HTTP_201_CREATED)
def create_scheme(
    scheme_in: SchemeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official"]))
):
    existing = db.query(Scheme).filter(Scheme.code == scheme_in.code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Scheme with this code already exists")

    scheme_dict = scheme_in.model_dump(exclude={"eligibility_rule"})
    scheme = Scheme(**scheme_dict)
    db.add(scheme)
    db.commit()
    db.refresh(scheme)

    rule_data = scheme_in.eligibility_rule.model_dump() if scheme_in.eligibility_rule else {}
    rule = EligibilityRule(scheme_id=scheme.id, **rule_data)
    db.add(rule)
    db.commit()
    db.refresh(scheme)

    audit = AuditLog(
        user_id=current_user.id,
        action="SCHEME_CREATE",
        resource="SCHEME",
        details=f"Registered public scheme {scheme.code} - {scheme.name}"
    )
    db.add(audit)

    # Event Notification
    notify_users_by_roles(
        db, ["Citizen", "Organization"],
        f"New Scheme Launched: {scheme.code}",
        f"New public welfare scheme '{scheme.name}' ({scheme.category}) has been launched. Benefits: {scheme.benefits or 'Direct benefit support'}.",
        "Scheme Alert"
    )

    db.commit()

    return scheme

@router.put("/{scheme_id}", response_model=SchemeOut)
@router.patch("/{scheme_id}", response_model=SchemeOut)
def update_scheme(
    scheme_id: int,
    scheme_in: SchemeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official"]))
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    update_data = scheme_in.model_dump(exclude_unset=True, exclude={"eligibility_rule"})
    for field, value in update_data.items():
        setattr(scheme, field, value)

    if scheme_in.eligibility_rule:
        if scheme.eligibility_rules:
            rule_data = scheme_in.eligibility_rule.model_dump(exclude_unset=True)
            for rfield, rval in rule_data.items():
                setattr(scheme.eligibility_rules, rfield, rval)
        else:
            rule = EligibilityRule(scheme_id=scheme.id, **scheme_in.eligibility_rule.model_dump())
            db.add(rule)

    db.commit()
    db.refresh(scheme)

    audit = AuditLog(
        user_id=current_user.id,
        action="SCHEME_UPDATE",
        resource="SCHEME",
        details=f"Updated public scheme {scheme.code}"
    )
    db.add(audit)

    # Event Notification
    notify_users_by_roles(
        db, ["Citizen", "Organization"],
        f"Scheme Guidelines Updated: {scheme.code}",
        f"Public scheme '{scheme.name}' guidelines have been updated.",
        "Scheme Alert"
    )

    db.commit()

    return scheme


@router.post("/{scheme_id}/archive", response_model=SchemeOut)
def archive_scheme(
    scheme_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official"]))
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    scheme.status = "Archived"
    db.commit()
    db.refresh(scheme)

    audit = AuditLog(
        user_id=current_user.id,
        action="SCHEME_ARCHIVE",
        resource="SCHEME",
        details=f"Archived scheme {scheme.code}"
    )
    db.add(audit)
    db.commit()

    return scheme

@router.delete("/{scheme_id}")
def delete_scheme(
    scheme_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official"]))
):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    db.delete(scheme)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="SCHEME_DELETE",
        resource="SCHEME",
        details=f"Deleted scheme ID {scheme_id}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Scheme ID {scheme_id} deleted successfully."}
