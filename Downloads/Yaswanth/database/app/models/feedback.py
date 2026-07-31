import uuid
from sqlalchemy import Column, String, Text, Integer, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin, generate_uuid


class Feedback(Base, TimestampMixin):
    """
    User Feedback records on public schemes or platform.
    One User can submit multiple Feedback records.
    """
    __tablename__ = "feedback"
    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='chk_feedback_rating_range'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    scheme_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("schemes.id", ondelete="SET NULL"), 
        nullable=True, 
        index=True
    )
    rating = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, default="general")

    # Relationships
    user = relationship("User", back_populates="feedbacks")
    scheme = relationship("Scheme", back_populates="feedbacks")

    def __repr__(self):
        return f"<Feedback(id={self.id}, rating={self.rating}, user_id={self.user_id})>"
