from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # Administrator, Government Official, Citizen, Researcher, Organization, Guest User
    department = Column(String(150), nullable=True)
    state = Column(String(100), nullable=True)
    occupation = Column(String(100), nullable=True)
    income_annual = Column(Numeric(12, 2), nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    education_level = Column(String(100), nullable=True)
    social_category = Column(String(50), nullable=True)
    disability_status = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    policies_created = relationship("Policy", foreign_keys="Policy.created_by_id", back_populates="created_by")
    policies_approved = relationship("Policy", foreign_keys="Policy.approved_by_id", back_populates="approved_by")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    feedback_items = relationship("Feedback", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    type = Column(String(50), default="BOTH")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    ministry = Column(String(200), nullable=False, index=True)
    department = Column(String(200), nullable=False, index=True)
    state = Column(String(100), default="All India", index=True)
    sector = Column(String(100), nullable=False, index=True)
    status = Column(String(50), default="DRAFT", index=True)
    rejection_reason = Column(Text, nullable=True)
    effective_date = Column(Date, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    document_url = Column(String(500), nullable=True)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    created_by = relationship("User", foreign_keys=[created_by_id], back_populates="policies_created")
    approved_by = relationship("User", foreign_keys=[approved_by_id], back_populates="policies_approved")
    schemes = relationship("Scheme", back_populates="policy", cascade="all, delete-orphan")

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    benefits = Column(Text, nullable=False)
    financial_assistance = Column(String(200), nullable=True)
    budget_allocated = Column(Numeric(15, 2), nullable=True)
    target_group = Column(String(200), nullable=True)
    application_process = Column(Text, nullable=True)
    application_link = Column(String(500), nullable=True)
    deadline = Column(Date, nullable=True)
    status = Column(String(50), default="Active", index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    policy = relationship("Policy", back_populates="schemes")
    eligibility_rules = relationship("EligibilityRule", back_populates="scheme", cascade="all, delete-orphan", uselist=False)

class EligibilityRule(Base):
    __tablename__ = "eligibility_rules"

    id = Column(Integer, primary_key=True, index=True)
    scheme_id = Column(Integer, ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    min_age = Column(Integer, default=0)
    max_age = Column(Integer, default=120)
    gender = Column(String(50), default="All")
    max_income = Column(Numeric(12, 2), default=99999999.99)
    occupation = Column(String(100), default="All")
    education_level = Column(String(100), default="All")
    location_type = Column(String(50), default="All")
    social_category = Column(String(50), default="All")
    disability_required = Column(Boolean, default=False)
    additional_notes = Column(Text, nullable=True)

    scheme = relationship("Scheme", back_populates="eligibility_rules")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="General")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_name = Column(String(150), nullable=True)
    email = Column(String(255), nullable=True)
    category = Column(String(100), default="General Enquiry")
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN")
    admin_response = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="feedback_items")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    report_type = Column(String(100), nullable=False)
    format = Column(String(20), nullable=False)
    file_path = Column(String(500), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    query_text = Column(String(255), nullable=True)
    filters_json = Column(JSON, nullable=True)
    results_count = Column(Integer, default=0)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
