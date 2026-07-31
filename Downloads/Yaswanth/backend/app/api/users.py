from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, User
from app.schemas.user import UserResponse
from app.dependencies import get_current_user, require_roles
from app.services.user_service import get_all_users

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description="Returns detailed profile of the currently authenticated user."
)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.get(
    "/",
    response_model=List[UserResponse],
    summary="List all users",
    description="Retrieves a list of all registered users (Admin access required)."
)
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["admin"]))
):
    return get_all_users(db, skip=skip, limit=limit)
