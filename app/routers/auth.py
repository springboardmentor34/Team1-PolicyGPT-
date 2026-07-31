from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.get("/test")
def test_auth():
    return {
        "message": "Auth router working"
    }