import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID


def generate_uuid() -> uuid.UUID:
    """Generate a random UUID v4."""
    return uuid.uuid4()


def current_utc_time() -> datetime:
    """Return timezone-aware current UTC time."""
    return datetime.now(timezone.utc)


class TimestampMixin:
    """Mixin for common created_at and updated_at columns."""
    created_at = Column(
        DateTime(timezone=True), 
        nullable=False, 
        default=current_utc_time
    )
    updated_at = Column(
        DateTime(timezone=True), 
        nullable=False, 
        default=current_utc_time, 
        onupdate=current_utc_time
    )
