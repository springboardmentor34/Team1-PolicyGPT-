import logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal, get_db
from app.models.models import User, Policy, Scheme, EligibilityRule, Notification, Feedback, AuditLog, Category
from app.core.security import get_password_hash

from app.api.v1 import auth, users, policies, schemes, search, eligibility, compare, notifications, analytics, reports, feedback, categories

logger = logging.getLogger("policygpt")

# Create DB tables if they don't exist yet
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for Angular Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(categories.router, prefix=settings.API_V1_STR)
app.include_router(policies.router, prefix=settings.API_V1_STR)
app.include_router(schemes.router, prefix=settings.API_V1_STR)
app.include_router(search.router, prefix=settings.API_V1_STR)
app.include_router(eligibility.router, prefix=settings.API_V1_STR)
app.include_router(compare.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_db_seed():
    db = SessionLocal()
    try:
        print("\n========================================")
        print("PolicyGPT Backend")
        print("========================================")
        print("✓ Application started successfully")
        print("✓ Database connection successful")
        print("✓ Database: PostgreSQL")
        print("✓ API routes loaded successfully")
        print("✓ PolicyGPT backend ready")
        print("========================================\n")

        users_to_seed = [
            User(
                full_name="System Administrator",
                email="admin@policygpt.gov.in",
                hashed_password=get_password_hash("Admin@123456"),
                role="Administrator",
                department="Ministry of Electronics & IT",
                state="New Delhi"
            ),
            User(
                full_name="Dr. Rajesh Verma",
                email="official@policygpt.gov.in",
                hashed_password=get_password_hash("Official@123456"),
                role="Government Official",
                department="Department of Agriculture",
                state="Uttar Pradesh"
            ),
            User(
                full_name="Priya Sharma",
                email="citizen@policygpt.gov.in",
                hashed_password=get_password_hash("Citizen@123456"),
                role="Citizen",
                state="Maharashtra",
                occupation="Farmer",
                income_annual=180000.0,
                age=28,
                gender="Female",
                education_level="Graduate",
                social_category="OBC"
            ),
            User(
                full_name="Prof. Anita Roy",
                email="researcher@policygpt.gov.in",
                hashed_password=get_password_hash("Researcher@123456"),
                role="Researcher",
                department="Policy Research Institute",
                state="Delhi"
            ),
            User(
                full_name="AgroTech Solutions NGO",
                email="org@policygpt.gov.in",
                hashed_password=get_password_hash("Org@123456"),
                role="Organization",
                department="Welfare & Agri Development",
                state="Karnataka"
            )
        ]
        for u in users_to_seed:
            existing = db.query(User).filter(User.email == u.email).first()
            if not existing:
                db.add(u)
        db.commit()

        # Seed sample policies if empty
        if db.query(Policy).count() == 0:

                pol1 = Policy(
                    title="National Agricultural & Farmer Support Policy 2024",
                    code="POL-AGRI-2024-01",
                    description="Comprehensive national framework aimed at doubling farmer income and modernizing irrigation systems.",
                    summary="Financial support and soil health testing for small farmers.",
                    category="Agriculture",
                    ministry="Ministry of Agriculture & Farmers Welfare",
                    department="Department of Agriculture and Farmers Welfare",
                    state="All India",
                    sector="Agriculture & Rural Development",
                    status="PUBLISHED",
                    created_by_id=2,
                    approved_by_id=1,
                    view_count=1420
                )
                pol2 = Policy(
                    title="Ayushman Digital Health & Wellness Guarantee Policy",
                    code="POL-HLTH-2024-02",
                    description="National policy mandating free secondary and tertiary healthcare coverage.",
                    summary="Universal health insurance coverage up to ₹5 Lakhs per family per annum.",
                    category="Healthcare",
                    ministry="Ministry of Health and Family Welfare",
                    department="National Health Authority",
                    state="All India",
                    sector="Public Health & Medicine",
                    status="PUBLISHED",
                    created_by_id=2,
                    approved_by_id=1,
                    view_count=2890
                )
                pol3 = Policy(
                    title="National Education Empowerment & Digital Literacy Policy",
                    code="POL-EDU-2024-03",
                    description="Policy framework promoting universal access to higher education and post-matric scholarship allocation.",
                    summary="Promotes post-matric scholarships and digital skill centers.",
                    category="Education",
                    ministry="Ministry of Education",
                    department="Department of Higher Education",
                    state="All India",
                    sector="Education & Skill Development",
                    status="PUBLISHED",
                    created_by_id=2,
                    approved_by_id=1,
                    view_count=3150
                )
                db.add_all([pol1, pol2, pol3])
                db.commit()

                # Seed sample schemes
                sch1 = Scheme(
                    name="PM-KISAN Samman Nidhi Scheme",
                    code="SCH-AGRI-001",
                    policy_id=pol1.id,
                    description="Direct income support scheme providing ₹6,000 per year to landholding farmer families.",
                    category="Farmer Welfare",
                    benefits="₹6,000 direct benefit transfer (DBT) annually into bank accounts.",
                    financial_assistance="₹6,000 per year",
                    budget_allocated=60000000000.0,
                    target_group="Small and marginal landholding farmers",
                    application_process="Apply online at PM-KISAN portal with Aadhaar card and land records.",
                    application_link="https://pmkisan.gov.in",
                    status="Active"
                )
                sch2 = Scheme(
                    name="Ayushman Bharat PM-JAY",
                    code="SCH-HLTH-002",
                    policy_id=pol2.id,
                    description="Health insurance scheme providing health cover of ₹5 Lakhs per family per year.",
                    category="Healthcare",
                    benefits="Cashless access to secondary and tertiary healthcare services.",
                    financial_assistance="Up to ₹500,000 coverage/year",
                    budget_allocated=120000000000.0,
                    target_group="Low-income households identified via SECC database",
                    application_process="Check eligibility online, visit nearest Ayushman Mitra center.",
                    application_link="https://pmjay.gov.in",
                    status="Active"
                )
                sch3 = Scheme(
                    name="Post-Matric Scholarship for Higher Education",
                    code="SCH-EDU-003",
                    policy_id=pol3.id,
                    description="Financial scholarship assistance to students pursuing post-secondary studies.",
                    category="Scholarships",
                    benefits="100% tuition fee reimbursement + monthly maintenance allowance.",
                    financial_assistance="Full tuition + Maintenance stipend",
                    budget_allocated=2500000000.0,
                    target_group="Students pursuing Diploma, UG, or PG degrees",
                    application_process="Submit application through National Scholarship Portal (NSP).",
                    application_link="https://scholarships.gov.in",
                    status="Active"
                )
                db.add_all([sch1, sch2, sch3])
                db.commit()

                # Seed eligibility rules
                r1 = EligibilityRule(scheme_id=sch1.id, min_age=18, max_age=75, max_income=500000.0, occupation="Farmer")
                r2 = EligibilityRule(scheme_id=sch2.id, min_age=0, max_age=100, max_income=300000.0)
                r3 = EligibilityRule(scheme_id=sch3.id, min_age=16, max_age=35, max_income=250000.0, occupation="Student")
                db.add_all([r1, r2, r3])
                db.commit()

    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "Online",
        "app": settings.PROJECT_NAME,
        "database_status": "Connected Successfully",
        "api_docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PolicyGPT Backend",
        "message": "✓ Application started successfully"
    }

@app.get("/health/database")
def health_check_db(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "engine": "PostgreSQL"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
