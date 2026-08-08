from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.search_service import search_items
from app.schemas.search import SearchResponse


router = APIRouter(
    prefix="/search",
    tags=["Search"]
)


@router.get("/", response_model=SearchResponse)
def search(
    query: str,
    db: Session = Depends(get_db)
):
    results = search_items(db, query)

    return {
        "query": query,
        "total": len(results),
        "results": results
    }