from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User, AuditLog
from app.schemas.schemas import UserOut, UserUpdate, UserStatusUpdate, UserRoleUpdate, UserCreate
from app.api.deps import require_authenticated_user, require_roles
from app.core.security import get_password_hash

router = APIRouter(prefix="/users", tags=["User Management"])

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user_admin(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator"]))
):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    valid_roles = ["Government Official", "Citizen", "Researcher", "Organization", "Administrator"]
    if user_in.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role specified. Must be one of {valid_roles}"
        )

    hashed_pwd = get_password_hash(user_in.password)
    db_user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=user_in.role,
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
        user_id=current_user.id,
        action="ADMIN_CREATE_USER",
        resource="USERS",
        details=f"Admin created account for {db_user.email} with role '{db_user.role}'"
    )
    db.add(audit)
    db.commit()

    return db_user

@router.get("/", response_model=List[UserOut])
def get_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator"]))
):
    from sqlalchemy import or_
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                User.full_name.ilike(search_pattern),
                User.email.ilike(search_pattern),
                User.department.ilike(search_pattern)
            )
        )
    return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{user_id}", response_model=UserOut)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    if current_user.role != "Administrator" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied to other user profiles.")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_user_profile(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authenticated_user)
):
    if current_user.role != "Administrator" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied to modify other user profiles.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_in.model_dump(exclude_unset=True)

    # Email uniqueness check
    if "email" in update_data and update_data["email"] and update_data["email"] != user.email:
        existing = db.query(User).filter(User.email == update_data["email"], User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="User with this email already exists.")

    # Role validation
    if "role" in update_data and update_data["role"]:
        if current_user.role != "Administrator":
            update_data.pop("role") # Only admin can change role
        else:
            valid_roles = ["Government Official", "Citizen", "Researcher", "Organization", "Administrator"]
            if update_data["role"] not in valid_roles:
                raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {valid_roles}")
            if (user.id == 1 or user.email == "admin@policygpt.gov.in") and update_data["role"] != "Administrator":
                raise HTTPException(status_code=400, detail="Cannot change role of primary System Administrator.")

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)

    audit = AuditLog(
        user_id=current_user.id,
        action="USER_UPDATE",
        resource="USERS",
        details=f"Updated profile details for user ID {user.id} ({user.email})"
    )
    db.add(audit)
    db.commit()

    return user


@router.patch("/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: int,
    status_in: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == 1 or user.email == "admin@policygpt.gov.in":
        raise HTTPException(status_code=400, detail="Cannot disable the primary System Administrator account.")

    user.is_active = status_in.is_active
    db.commit()
    db.refresh(user)

    audit = AuditLog(
        user_id=current_user.id,
        action="USER_STATUS_CHANGE",
        resource="USERS",
        details=f"Set user ID {user.id} active status to {user.is_active}"
    )
    db.add(audit)
    db.commit()

    return user

@router.patch("/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    role_in: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.id == 1 or user.email == "admin@policygpt.gov.in":
        raise HTTPException(status_code=400, detail="Cannot change role of primary System Administrator.")

    valid_roles = ["Government Official", "Citizen", "Researcher", "Organization", "Administrator"]
    if role_in.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Allowed: {valid_roles}")

    user.role = role_in.role
    db.commit()
    db.refresh(user)

    audit = AuditLog(
        user_id=current_user.id,
        action="ROLE_CHANGE",
        resource="USERS",
        details=f"Changed user ID {user.id} role to {user.role}"
    )
    db.add(audit)
    db.commit()

    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["Administrator"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == 1 or user.email == "admin@policygpt.gov.in":
        raise HTTPException(status_code=400, detail="Cannot delete primary System Administrator account.")

    db.delete(user)
    db.commit()

    audit = AuditLog(
        user_id=current_user.id,
        action="USER_DELETE",
        resource="USERS",
        details=f"Deleted user ID {user_id}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"User ID {user_id} successfully deleted."}
