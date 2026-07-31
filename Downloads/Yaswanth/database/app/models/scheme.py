import uuid
from sqlalchemy import Column, String, Text, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin, generate_uuid


class Scheme(Base, TimestampMixin):
    """
    Public Scheme entity belonging to a Policy.
    One Policy can have many Schemes.
    One Scheme can have multiple Eligibility Rules and Feedback records.
    """
    __tablename__ = "schemes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid, index=True)
    policy_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("policies.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    title = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    summary = Column(Text, nullable=False)
    benefits_summary = Column(Text, nullable=False)
    budget_allocation = Column(Numeric(15, 2), nullable=False, default=0.00)
    status = Column(String(50), nullable=False, default="active", index=True)

    # Relationships
    policy = relationship("Policy", back_populates="schemes")
    eligibility_rules = relationship("EligibilityRule", back_populates="scheme", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="scheme")

    def __repr__(self):
        return f"<Scheme(id={self.id}, code='{self.code}', title='{self.title}')>"
