import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin, generate_uuid


class Report(Base, TimestampMixin):
    """
    Generated Intelligence & Analytical Reports.
    One User can generate multiple Reports.
    """
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    report_type = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    parameters_json = Column(JSONB, nullable=False, default=dict)
    content_json = Column(JSONB, nullable=False, default=dict)
    status = Column(String(50), nullable=False, default="pending", index=True)

    # Relationships
    user = relationship("User", back_populates="reports")

    def __repr__(self):
        return f"<Report(id={self.id}, title='{self.title}', status='{self.status}')>"
