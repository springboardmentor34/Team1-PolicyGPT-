import uuid
from sqlalchemy import Column, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin, generate_uuid


class SearchHistory(Base, TimestampMixin):
    """
    User Search Queries & History.
    One User can have multiple Search History records.
    """
    __tablename__ = "search_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    search_query = Column(Text, nullable=False)
    filters_applied = Column(JSONB, nullable=False, default=dict)
    results_count = Column(Integer, nullable=False, default=0)

    # Relationships
    user = relationship("User", back_populates="search_histories")

    def __repr__(self):
        return f"<SearchHistory(id={self.id}, user_id={self.user_id}, search_query='{self.search_query[:30]}')>"
