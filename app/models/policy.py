import uuid
from sqlalchemy import Column, String, Text, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin, generate_uuid


class Policy(Base, TimestampMixin):
    """
    Government Policy entity.
    One User can upload many Policies.
    One Policy can contain many Schemes.
    """
    __tablename__ = "policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    sector = Column(String(100), nullable=False, index=True)
    ministry_or_department = Column(String(200), nullable=False, index=True)
    effective_date = Column(Date, nullable=False)
    status = Column(String(50), nullable=False, default="active", index=True)
    uploaded_by_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="SET NULL"), 
        nullable=True, 
        index=True
    )

    # Relationships
    uploader = relationship("User", back_populates="policies")
    schemes = relationship("Scheme", back_populates="policy", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Policy(id={self.id}, title='{self.title}', sector='{self.sector}')>"
