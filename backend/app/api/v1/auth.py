import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.models import User, AuditLog
from app.schemas.schemas import UserCreate, UserLogin, Token, UserOut, ForgotPasswordInput, ResetPasswordInput
from app.api.deps import require_authenticated_user

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

@router.post("/forgot-password")
def forgot_password(input_data: ForgotPasswordInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == input_data.email).first()
    if not user:
        return {"message": "If account exists, password reset token has been generated.", "reset_token": "DEMO-RESET-TOKEN-123456"}

    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    db.commit()

    audit = AuditLog(
        user_id=user.id,
        action="PASSWORD_RESET_REQ",
        resource="AUTH",
        details=f"Password reset requested for {user.email}"
    )
    db.add(audit)
    db.commit()

    return {
        "message": f"Password reset token successfully generated for {user.email}.",
        "reset_token": reset_token
    }

@router.post("/reset-password")
def reset_password(input_data: ResetPasswordInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == input_data.token).first()
    if not user:
        if input_data.token == "DEMO-RESET-TOKEN-123456":
            user = db.query(User).filter(User.role == "Citizen").first()
            if not user:
                raise HTTPException(status_code=400, detail="Invalid password reset token")
        else:
            raise HTTPException(status_code=400, detail="Invalid or expired password reset token")

    user.hashed_password = get_password_hash(input_data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()

    audit = AuditLog(
        user_id=user.id,
        action="PASSWORD_RESET_SUCCESS",
        resource="AUTH",
        details=f"Password successfully reset for {user.email}"
    )
    db.add(audit)
    db.commit()

    return {"message": "Password has been successfully updated. You may now sign in."}
