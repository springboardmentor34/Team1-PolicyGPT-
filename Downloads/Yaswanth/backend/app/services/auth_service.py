from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import get_password_hash, verify_password
from app.core.jwt import create_access_token
from app.database import User
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, UserAuthResponse, normalize_role


def register_user(db: Session, request: SignupRequest) -> TokenResponse:
    """Register a new user, validate input, hash password, and issue JWT token."""
    # 1. Validate password confirmation
    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and confirm password do not match."
        )

    # 2. Check duplicate email
    existing_user = db.query(User).filter(User.email == request.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )

    # 3. Normalize role
    normalized_role = normalize_role(request.role)
    allowed_roles = ["citizen", "policy_officer", "admin"]
    if normalized_role not in allowed_roles:
        normalized_role = "citizen"

    # 4. Hash password and save user
    hashed_pwd = get_password_hash(request.password)
    new_user = User(
        full_name=request.full_name or request.email.split("@")[0],
        email=request.email.lower(),
        phone_number=request.phone_number,
        hashed_password=hashed_pwd,
        role=normalized_role,
        is_active=True,
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 5. Generate token
    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserAuthResponse(
            id=new_user.id,
            full_name=new_user.full_name,
            email=new_user.email,
            role=new_user.role
        )
    )


def authenticate_user(db: Session, request: LoginRequest) -> TokenResponse:
    """Authenticate user credentials, check role, and return JWT token."""
    # 1. Find user by email
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Verify password
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Check role validation
    requested_role = normalize_role(request.role)
    if requested_role and user.role.lower() != requested_role:
        # Flexible check: if user role in DB matches requested role
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: User registered role is '{user.role}', but logged in as '{request.role}'."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive."
        )

    # 4. Generate JWT token
    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserAuthResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            role=user.role
        )
    )
