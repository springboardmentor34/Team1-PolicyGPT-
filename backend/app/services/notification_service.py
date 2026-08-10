from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import Notification, User

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notif_type: str = "General"
) -> Optional[Notification]:
    if not user_id:
        return None
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
        is_read=False
    )
    db.add(notif)
    return notif

def notify_users_by_role(
    db: Session,
    role: str,
    title: str,
    message: str,
    notif_type: str = "General"
) -> List[Notification]:
    users = db.query(User).filter(User.role == role).all()
    notifs = []
    for u in users:
        n = create_notification(db, u.id, title, message, notif_type)
        if n:
            notifs.append(n)
    return notifs

def notify_users_by_roles(
    db: Session,
    roles: List[str],
    title: str,
    message: str,
    notif_type: str = "General"
) -> List[Notification]:
    users = db.query(User).filter(User.role.in_(roles)).all()
    notifs = []
    for u in users:
        n = create_notification(db, u.id, title, message, notif_type)
        if n:
            notifs.append(n)
    return notifs

def notify_all_users(
    db: Session,
    title: str,
    message: str,
    notif_type: str = "General"
) -> List[Notification]:
    users = db.query(User).all()
    notifs = []
    for u in users:
        n = create_notification(db, u.id, title, message, notif_type)
        if n:
            notifs.append(n)
    return notifs
