import uuid
from sqlalchemy import Column, String, Integer, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin, generate_uuid


class EligibilityRule(Base, TimestampMixin):
    """
    Eligibility Rule criteria for a Scheme.
    One Scheme can have multiple Eligibility Rules.
    """
    __tablename__ = "eligibility_rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=generate_uuid, index=True)
    scheme_id = Column(
        UUID(as_uuid=True), 
        ForeignKey("schemes.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    rule_name = Column(String(150), nullable=False)
    min_age = Column(Integer, nullable=True)
    max_age = Column(Integer, nullable=True)
    max_income = Column(Numeric(12, 2), nullable=True)
    gender_requirement = Column(String(20), nullable=False, default="all")
    caste_category = Column(String(50), nullable=False, default="all")
    state_or_region = Column(String(100), nullable=False, default="all", index=True)
    occupation_type = Column(String(100), nullable=False, default="all")
    rule_criteria_json = Column(JSONB, nullable=False, default=dict)

    # Relationships
    scheme = relationship("Scheme", back_populates="eligibility_rules")

    def __repr__(self):
        return f"<EligibilityRule(id={self.id}, scheme_id={self.scheme_id}, rule_name='{self.rule_name}')>"
