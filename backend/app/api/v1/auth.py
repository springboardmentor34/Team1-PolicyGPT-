import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, AuditLog
from app.schemas.schemas import UserCreate, UserLogin, Token, UserOut, ForgotPasswordInput, ResetPasswordInput
from app.api.deps import require_authenticated_user
from app.services.notification_service import create_notification, notify_users_by_role
from app.services.email_service import send_password_reset_email


router = APIRouter(prefix="/auth", tags=["Authentication & Role Management"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # PUBLIC REGISTRATION RESTRICTED TO CITIZEN ROLE ONLY
    if user_in.role and user_in.role != "Citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public self-registration is permitted for Citizen accounts only. Privileged accounts (Government Official, Organization, Researcher, Administrator) are provisioned exclusively by System Administrators.",
        )

    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists.",
        )

    hashed_pwd = get_password_hash(user_in.password)
    db_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        hashed_password=hashed_pwd,
        role="Citizen",  # HARDCODED CITIZEN ROLE
        department=user_in.department,
        state=user_in.state,
        occupation=user_in.occupation,
        income_annual=user_in.income_annual,
        age=user_in.age,
        gender=user_in.gender,
        education_level=user_in.education_level,
        social_category=user_in.social_category,
        disability_status=user_in.disability_status,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    audit = AuditLog(
        user_id=db_user.id,
        action="CITIZEN_REGISTER",
        resource="AUTH",
        details=f"Public Citizen account registered for {db_user.email}"
    )
    db.add(audit)

    # Event Notifications
    create_notification(
        db, db_user.id,
        "Welcome to PolicyGPT Portal",
        f"Welcome {db_user.full_name}! Your Citizen account has been registered successfully. Explore welfare schemes and verify eligibility.",
        "System Alert"
    )


    notify_users_by_role(
        db, "Administrator",
        "New Citizen Self-Registration",
        f"New Citizen account registered for {db_user.full_name} ({db_user.email}) in state {db_user.state or 'Not specified'}.",
        "System Alert"
    )

    db.commit()

    return db_user


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGIN",
        resource="AUTH",
        details=f"User {user.email} logged in successfully"
    )
    db.add(audit)
    db.commit()

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )

@router.get("/me", response_model=UserOut)
def read_current_user(current_user: User = Depends(require_authenticated_user)):
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(require_authenticated_user), db: Session = Depends(get_db)):
    audit = AuditLog(
        user_id=current_user.id,
        action="USER_LOGOUT",
        resource="AUTH",
        details=f"User {current_user.email} logged out"
    )
    db.add(audit)
    db.commit()
    return {"message": "Logged out successfully"}

GENERIC_FORGOT_SUCCESS_MSG = "If an account with that email address exists, password reset instructions have been sent to your email inbox."

@router.post("/forgot-password")
def forgot_password(
    input_data: ForgotPasswordInput,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    email_clean = input_data.email.strip().lower()
    user = db.query(User).filter(User.email.ilike(email_clean)).first()

    if user and user.is_active:
        raw_token = secrets.token_urlsafe(32)
        hashed_token = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        user.reset_token = hashed_token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(minutes=15)
        db.commit()

        audit = AuditLog(
            user_id=user.id,
            action="PASSWORD_RESET_REQ",
            resource="AUTH",
            details=f"Password reset requested for user {user.email}"
        )
        db.add(audit)
        db.commit()

        # Send reset link email in background task so HTTP response returns immediately
        background_tasks.add_task(send_password_reset_email, user.email, raw_token)

    return {"message": GENERIC_FORGOT_SUCCESS_MSG}


@router.post("/reset-password")
def reset_password(input_data: ResetPasswordInput, db: Session = Depends(get_db)):
    raw_token = (input_data.token or "").strip()
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token"
        )

    if not input_data.new_password or len(input_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long"
        )

    incoming_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    user = db.query(User).filter(User.reset_token == incoming_hash).first()

    if not user or not user.reset_token_expires:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token"
        )

    expires = user.reset_token_expires
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    now_utc = datetime.now(timezone.utc)
    if now_utc > expires:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token"
        )

    # Hash new password using PolicyGPT's bcrypt security helper
    user.hashed_password = get_password_hash(input_data.new_password)
    # Immediately invalidate token (single-use)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    audit = AuditLog(
        user_id=user.id,
        action="PASSWORD_RESET_SUCCESS",
        resource="AUTH",
        details=f"Password successfully reset for user {user.email}"
    )
    db.add(audit)
    db.commit()

    return {"message": "Password has been successfully updated. You may now sign in."}

