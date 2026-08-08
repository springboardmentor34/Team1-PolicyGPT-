from typing import List
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime


class SearchResult(BaseModel):
    id: UUID
    title: str
    type: str
    description: str | None = None

    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[SearchResult]