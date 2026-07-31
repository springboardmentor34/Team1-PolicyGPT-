from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db, User
from app.schemas.scheme import SchemeResponse, SchemeCreate, SchemeUpdate
from app.dependencies import require_roles
from app.services.scheme_service import create_scheme, get_scheme_by_id, get_all_schemes, update_scheme

router = APIRouter(prefix="/schemes", tags=["Public Schemes"])


@router.get(
    "/",
    response_model=List[SchemeResponse],
    summary="List schemes",
    description="Returns list of all public schemes."
)
def list_schemes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_all_schemes(db, skip=skip, limit=limit)


@router.post(
    "/",
    response_model=SchemeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create public scheme",
    description="Creates a new public scheme under an existing policy (Requires policy_officer or admin role)."
)
def add_scheme(
    scheme_in: SchemeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["policy_officer", "admin"]))
):
    return create_scheme(db, scheme_in)


@router.get(
    "/{scheme_id}",
    response_model=SchemeResponse,
    summary="Get scheme by ID",
    description="Returns detailed information of a specific scheme."
)
def get_scheme(scheme_id: UUID, db: Session = Depends(get_db)):
    scheme = get_scheme_by_id(db, scheme_id)
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheme not found")
    return scheme
