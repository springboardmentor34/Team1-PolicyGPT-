from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse
from app.services.auth_service import register_user, authenticate_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Registers a citizen, policy officer, or administrator. Hashes password and returns authenticated user and JWT token."
)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    return register_user(db=db, request=request)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="User Login",
    description="Authenticates user credentials, validates selected role, and generates JWT bearer token."
)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    return authenticate_user(db=db, request=request)
