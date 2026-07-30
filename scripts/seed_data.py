"""
PolicyGPT Database Seeding Script
Populates sample realistic data for all 9 tables in the PostgreSQL database.
"""

import sys
import os
from datetime import date

# Append root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models import (
    User, Policy, Scheme, EligibilityRule,
    Notification, Feedback, Report, AuditLog, SearchHistory
)


def seed_database():
    """Seed the database with sample initial data."""
    print("Starting PolicyGPT Database Seeding Process...")
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Users
        admin_user = db.query(User).filter_by(email="admin@policygpt.gov.in").first()
        if not admin_user:
            admin_user = User(
                email="admin@policygpt.gov.in",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW",
                full_name="System Administrator",
                role="admin",
                is_active=True,
                is_verified=True
            )
            db.add(admin_user)

        officer_user = db.query(User).filter_by(email="officer.agriculture@gov.in").first()
        if not officer_user:
            officer_user = User(
                email="officer.agriculture@gov.in",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW",
                full_name="Rajesh Sharma",
                role="policy_officer",
                is_active=True,
                is_verified=True
            )
            db.add(officer_user)

        citizen_user = db.query(User).filter_by(email="citizen.priya@gmail.com").first()
        if not citizen_user:
            citizen_user = User(
                email="citizen.priya@gmail.com",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW",
                full_name="Priya Patel",
                role="citizen",
                is_active=True,
                is_verified=True
            )
            db.add(citizen_user)

        db.commit()
        db.refresh(admin_user)
        db.refresh(officer_user)
        db.refresh(citizen_user)
        print("Users seeded successfully.")

        # 2. Policies
        policy_agri = db.query(Policy).filter_by(title="National Agriculture Growth Policy 2026").first()
        if not policy_agri:
            policy_agri = Policy(
                title="National Agriculture Growth Policy 2026",
                description="Comprehensive national policy to enhance agricultural output, income security, and sustainable farming methods across rural India.",
                sector="Agriculture",
                ministry_or_department="Ministry of Agriculture and Farmers Welfare",
                effective_date=date(2026, 1, 1),
                status="active",
                uploaded_by_id=officer_user.id
            )
            db.add(policy_agri)

        policy_edu = db.query(Policy).filter_by(title="Digital Literacy and Education Empowerment Framework").first()
        if not policy_edu:
            policy_edu = Policy(
                title="Digital Literacy and Education Empowerment Framework",
                description="Policy aimed at bridging the digital divide in primary and secondary education institutions across tier-2 and tier-3 cities.",
                sector="Education",
                ministry_or_department="Ministry of Education",
                effective_date=date(2025, 6, 15),
                status="active",
                uploaded_by_id=admin_user.id
            )
            db.add(policy_edu)

        db.commit()
        db.refresh(policy_agri)
        db.refresh(policy_edu)
        print("Policies seeded successfully.")

        # 3. Schemes
        scheme_kisan = db.query(Scheme).filter_by(code="PM-KISAN-2026").first()
        if not scheme_kisan:
            scheme_kisan = Scheme(
                policy_id=policy_agri.id,
                title="PM Kisan Samman Nidhi Scheme",
                code="PM-KISAN-2026",
                summary="Direct income support scheme transferring Rs. 6,000 per year in three equal installments to eligible farmer families.",
                benefits_summary="Rs 6,000 annual direct benefit transfer into bank accounts.",
                budget_allocation=60000000000.00,
                status="active"
            )
            db.add(scheme_kisan)

        scheme_tablet = db.query(Scheme).filter_by(code="DSTG-2026").first()
        if not scheme_tablet:
            scheme_tablet = Scheme(
                policy_id=policy_edu.id,
                title="Digital Student Tablet Grant Scheme",
                code="DSTG-2026",
                summary="Providing tablet devices and free educational internet connectivity to underprivileged students.",
                benefits_summary="Free 10-inch Android tablet with 100GB monthly data.",
                budget_allocation=15000000000.00,
                status="active"
            )
            db.add(scheme_tablet)

        db.commit()
        db.refresh(scheme_kisan)
        db.refresh(scheme_tablet)
        print("Schemes seeded successfully.")

        # 4. Eligibility Rules
        rule_kisan = db.query(EligibilityRule).filter_by(scheme_id=scheme_kisan.id).first()
        if not rule_kisan:
            rule_kisan = EligibilityRule(
                scheme_id=scheme_kisan.id,
                rule_name="Small & Marginal Farmers Criteria",
                min_age=18,
                max_age=75,
                max_income=250000.00,
                gender_requirement="all",
                caste_category="all",
                state_or_region="all",
                occupation_type="Farmer",
                rule_criteria_json={"land_holding_limit_acres": 5, "require_land_records": True}
            )
            db.add(rule_kisan)

        rule_tablet = db.query(EligibilityRule).filter_by(scheme_id=scheme_tablet.id).first()
        if not rule_tablet:
            rule_tablet = EligibilityRule(
                scheme_id=scheme_tablet.id,
                rule_name="Secondary Student Eligibility",
                min_age=12,
                max_age=18,
                max_income=180000.00,
                gender_requirement="all",
                caste_category="all",
                state_or_region="all",
                occupation_type="Student",
                rule_criteria_json={"enrolled_in_govt_school": True, "minimum_attendance_pct": 75}
            )
            db.add(rule_tablet)

        # 5. Notifications
        notif = db.query(Notification).filter_by(user_id=citizen_user.id).first()
        if not notif:
            notif = Notification(
                user_id=citizen_user.id,
                title="PM Kisan Installment Released",
                message="Your 16th installment under PM Kisan Samman Nidhi has been credited to your bank account.",
                notification_type="scheme_alert",
                is_read=False
            )
            db.add(notif)

        # 6. Feedback
        fb = db.query(Feedback).filter_by(user_id=citizen_user.id).first()
        if not fb:
            fb = Feedback(
                user_id=citizen_user.id,
                scheme_id=scheme_kisan.id,
                rating=5,
                comments="The direct bank transfer was fast and hassle-free!",
                category="scheme_inquiry"
            )
            db.add(fb)

        # 7. Reports
        rpt = db.query(Report).filter_by(user_id=officer_user.id).first()
        if not rpt:
            rpt = Report(
                user_id=officer_user.id,
                report_type="scheme_comparison",
                title="Q1 2026 Agriculture Scheme Impact Report",
                parameters_json={"sector": "Agriculture", "year": 2026},
                content_json={"total_beneficiaries": 12000000, "disbursed_amount_inr": 24000000000},
                status="completed"
            )
            db.add(rpt)

        # 8. Audit Logs
        audit = db.query(AuditLog).filter_by(user_id=officer_user.id).first()
        if not audit:
            audit = AuditLog(
                user_id=officer_user.id,
                action="CREATE_POLICY",
                entity_type="policy",
                entity_id=str(policy_agri.id),
                ip_address="192.168.1.50",
                details_json={"policy_title": "National Agriculture Growth Policy 2026"}
            )
            db.add(audit)

        # 9. Search History
        sh = db.query(SearchHistory).filter_by(user_id=citizen_user.id).first()
        if not sh:
            sh = SearchHistory(
                user_id=citizen_user.id,
                search_query="farmer direct subsidy schemes 2026",
                filters_applied={"sector": "Agriculture", "max_income": 250000},
                results_count=5
            )
            db.add(sh)

        db.commit()
        print("Successfully seeded all 9 tables in PolicyGPT database!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
