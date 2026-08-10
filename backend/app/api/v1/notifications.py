from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Notification, User
from app.schemas.schemas import NotificationOut
from app.api.deps import require_authenticated_user, require_roles

router = APIRouter(prefix="/notifications", tags=["Notification System"])

@router.get("/", response_model=List[NotificationOut])
def get_user_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return notifications

@router.get("/unread-count")
def get_unread_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}

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

@router.put("/read-all")
def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == current_user.id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notification)
    db.commit()
    return {"message": f"Notification #{notification_id} deleted successfully"}

@router.post("/create")
def create_notification(
    title: str,
    message: str,
    target_user_id: Optional[int] = None,
    target_role: Optional[str] = None,
    notif_type: str = "General",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator", "Government Official"]))
):
    created_notifs = []
    if target_user_id:
        notif = Notification(
            user_id=target_user_id,
            title=title,
            message=message,
            type=notif_type,
            is_read=False
        )
        db.add(notif)
        created_notifs.append(notif)
    elif target_role:
        target_users = db.query(User).filter(User.role == target_role).all()
        for u in target_users:
            notif = Notification(
                user_id=u.id,
                title=title,
                message=message,
                type=notif_type,
                is_read=False
            )
            db.add(notif)
            created_notifs.append(notif)
    else:
        # Broadcast to all users
        all_users = db.query(User).all()
        for u in all_users:
            notif = Notification(
                user_id=u.id,
                title=title,
                message=message,
                type=notif_type,
                is_read=False
            )
            db.add(notif)
            created_notifs.append(notif)

    db.commit()
    return {"status": "Success", "notifications_sent": len(created_notifs)}

@router.post("/send-test-alert")
def send_test_alert(
    title: str,
    message: str,
    alert_type: str = "Policy Alert",
    channel: str = "in_app", # in_app, email, sms
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
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

