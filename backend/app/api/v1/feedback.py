from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Feedback, User, AuditLog
from app.schemas.schemas import FeedbackCreate, FeedbackOut
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/feedback", tags=["Feedback & Support Module"])

@router.post("/", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    feedback_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    feedback = Feedback(
        user_id=current_user.id if current_user else None,
        user_name=current_user.full_name if current_user else feedback_in.user_name or "Guest Citizen",
        email=current_user.email if current_user else feedback_in.email or "guest@policygpt.gov.in",
        category=feedback_in.category,
        subject=feedback_in.subject,
        message=feedback_in.message,
        status="OPEN"
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback

@router.get("/", response_model=List[FeedbackOut])
def get_all_feedback(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official"]))
):
    from sqlalchemy import or_, cast, String
    query = db.query(Feedback)
    if status_filter:
        query = query.filter(Feedback.status.ilike(status_filter))
    if category:
        query = query.filter(Feedback.category == category)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                cast(Feedback.id, String).ilike(pattern),
                Feedback.user_name.ilike(pattern),
                Feedback.email.ilike(pattern),
                Feedback.subject.ilike(pattern),
                Feedback.message.ilike(pattern)
            )
        )
    return query.order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()

@router.put("/{feedback_id}/respond", response_model=FeedbackOut)
@router.patch("/{feedback_id}", response_model=FeedbackOut)
def respond_to_feedback(
    feedback_id: int,
    response_text: Optional[str] = None,
    status_update: Optional[str] = "RESOLVED",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official"]))
):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback query not found")

    if response_text is not None:
        fb.admin_response = response_text
    if status_update:
        fb.status = status_update.upper()
    db.commit()
    db.refresh(fb)

    audit = AuditLog(
        user_id=current_user.id,
        action="INQUIRY_RESPONSE",
        resource="SUPPORT_TICKET",
        details=f"Updated support ticket #{fb.id} status to {fb.status}"
    )
    db.add(audit)
    db.commit()

    return fb

@router.delete("/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator"]))
):
    fb = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback query not found")

    db.delete(fb)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="INQUIRY_DELETE",
        resource="SUPPORT_TICKET",
        details=f"Deleted support ticket #{feedback_id}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Support ticket #{feedback_id} deleted successfully."}

@router.get("/faqs")
def get_faqs():
    return [
        {
            "id": 1,
            "category": "Policy Search",
            "question": "How do I search for policies applicable to my specific state?",
            "answer": "Navigate to Policy Search, select your State from the State filter dropdown (e.g. Maharashtra, UP), or select 'All India' for central government policies."
        },
        {
            "id": 2,
            "category": "Eligibility Checker",
            "question": "What parameters are evaluated during scheme matching?",
            "answer": "The engine matches your Age, Annual Household Income, Gender, Occupation, Education Level, Location (Urban/Rural), Social Category, and Disability Status."
        },
        {
            "id": 3,
            "category": "Policy Comparison",
            "question": "Can I compare policies across different ministries?",
            "answer": "Yes! Select up to 4 policies or schemes on the search page and click 'Compare Selected' to view side-by-side matrices of benefits, budgets, and criteria."
        },
        {
            "id": 4,
            "category": "Authentication",
            "question": "How can I register as a Government Official or Researcher?",
            "answer": "Select 'Register' on the top navigation bar, pick your designated role from the role selection dropdown, provide official details, and submit."
        }
    ]
