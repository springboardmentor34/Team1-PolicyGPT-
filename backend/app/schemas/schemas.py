from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any
from datetime import date, datetime

# --- Auth & User Schemas ---
class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: Optional[str] = "Citizen"
    department: Optional[str] = None
    state: Optional[str] = None
    occupation: Optional[str] = None
    income_annual: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    education_level: Optional[str] = None
    social_category: Optional[str] = None
    disability_status: Optional[bool] = False

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordInput(BaseModel):
    email: EmailStr

class ResetPasswordInput(BaseModel):
    token: str
    new_password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    department: Optional[str] = None
    state: Optional[str] = None
    occupation: Optional[str] = None
    income_annual: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    education_level: Optional[str] = None
    social_category: Optional[str] = None
    disability_status: Optional[bool] = None

class UserStatusUpdate(BaseModel):
    is_active: bool

class UserRoleUpdate(BaseModel):
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"

class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: Optional[str] = "BOTH"

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    slug: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Eligibility Rules Schemas ---
class EligibilityRuleBase(BaseModel):
    min_age: Optional[int] = 0
    max_age: Optional[int] = 120
    gender: Optional[str] = "All"
    max_income: Optional[float] = 99999999.99
    occupation: Optional[str] = "All"
    education_level: Optional[str] = "All"
    location_type: Optional[str] = "All"
    social_category: Optional[str] = "All"
    disability_required: Optional[bool] = False
    additional_notes: Optional[str] = None

class EligibilityRuleOut(EligibilityRuleBase):
    id: int
    scheme_id: int

    class Config:
        from_attributes = True

# --- Policy Schemas ---
class PolicyBase(BaseModel):
    title: str
    code: str
    description: str
    summary: Optional[str] = None
    category: str
    ministry: str
    department: str
    state: Optional[str] = "All India"
    sector: str
    status: Optional[str] = "DRAFT"
    rejection_reason: Optional[str] = None
    effective_date: Optional[date] = None
    document_url: Optional[str] = None

class PolicyCreate(PolicyBase):
    pass

class PolicyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    summary: Optional[str] = None
    category: Optional[str] = None
    ministry: Optional[str] = None
    department: Optional[str] = None
    state: Optional[str] = None
    sector: Optional[str] = None
    status: Optional[str] = None
    rejection_reason: Optional[str] = None
    effective_date: Optional[date] = None
    document_url: Optional[str] = None

class PolicyStatusUpdate(BaseModel):
    status: str
    rejection_reason: Optional[str] = None

class PolicyOut(PolicyBase):
    id: int
    created_by_id: Optional[int] = None
    approved_by_id: Optional[int] = None
    view_count: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Scheme Schemas ---
class SchemeBase(BaseModel):
    name: str
    code: str
    policy_id: Optional[int] = None
    description: str
    category: str
    benefits: str
    financial_assistance: Optional[str] = None
    budget_allocated: Optional[float] = None
    target_group: Optional[str] = None
    application_process: Optional[str] = None
    application_link: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[str] = "Active"

class SchemeCreate(SchemeBase):
    eligibility_rule: Optional[EligibilityRuleBase] = None

class SchemeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    benefits: Optional[str] = None
    financial_assistance: Optional[str] = None
    budget_allocated: Optional[float] = None
    target_group: Optional[str] = None
    application_process: Optional[str] = None
    application_link: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[str] = None
    policy_id: Optional[int] = None
    eligibility_rule: Optional[EligibilityRuleBase] = None

class SchemeOut(SchemeBase):
    id: int
    created_at: datetime
    eligibility_rules: Optional[EligibilityRuleOut] = None

    class Config:
        from_attributes = True

# --- Eligibility Check Schemas ---
class EligibilityCheckInput(BaseModel):
    age: int
    gender: str
    income_annual: float
    occupation: str
    education_level: str
    location_type: str = "All"
    social_category: str = "General"
    disability_status: bool = False
    category: Optional[str] = None

class SchemeEligibilityResult(BaseModel):
    scheme: SchemeOut
    match_score: int
    is_eligible: bool
    reasons: List[str]
    missing_criteria: List[str]
    application_guidance: str

# --- Notification Schemas ---
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Feedback Schemas ---
class FeedbackCreate(BaseModel):
    user_name: Optional[str] = None
    email: Optional[EmailStr] = None
    category: str = "General Enquiry"
    subject: str
    message: str

class FeedbackOut(FeedbackCreate):
    id: int
    user_id: Optional[int] = None
    status: str
    admin_response: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Audit & Analytics Schemas ---
class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    resource: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

Token.model_rebuild()
