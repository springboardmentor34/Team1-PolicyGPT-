from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Notification, User
from app.schemas.schemas import NotificationOut
from app.api.deps import require_authenticated_user

router = APIRouter(prefix="/notifications", tags=["Notification System"])

@router.get("/", response_model=List[NotificationOut])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return notifications

@router.put("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification

@router.post("/send-test-alert")
def send_test_alert(
    title: str,
    message: str,
    alert_type: str = "Policy Alert",
    channel: str = "in_app", # in_app, email, sms
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    # Dispatch In-App Notification
    notif = Notification(
        user_id=current_user.id,
        title=title,
        message=message,
        type=alert_type,
        is_read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)

    return {
        "status": "Success",
        "notification_id": notif.id,
        "channel": channel,
        "message": f"Alert '{title}' dispatched via {channel.upper()} to {current_user.email}."
    }
