from typing import Optional
from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.core.database import get_db
from app.models.models import Policy, Scheme, User, Report, AuditLog
from app.services.report_service import generate_policies_pdf, generate_schemes_excel, generate_department_pdf, generate_analytics_pdf
from app.api.deps import require_authenticated_user, get_current_user

router = APIRouter(prefix="/reports", tags=["Reports & Export Module"])

from app.services.notification_service import create_notification

def log_report(db: Session, title: str, rtype: str, rfmt: str, user: Optional[User] = None):
    rep = Report(
        title=title,
        report_type=rtype,
        format=rfmt,
        created_by_id=user.id if user else None
    )
    db.add(rep)
    if user:
        audit = AuditLog(
            user_id=user.id,
            action="REPORT_GENERATE",
            resource="REPORT",
            details=f"Generated {rtype} report in {rfmt} format"
        )
        db.add(audit)

        create_notification(
            db, user.id,
            f"Report Generated: {title}",
            f"Your {rtype} report in {rfmt} format has been generated successfully.",
            "Report Alert"
        )
    db.commit()


@router.get("/policies/pdf")
def export_policies_pdf(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    policies = db.query(Policy).all()
    pdf_bytes = generate_policies_pdf(policies)
    log_report(db, "Official Policies Report", "Policy Summary", "PDF", current_user)
    
    headers = {'Content-Disposition': 'attachment; filename="PolicyGPT_Policies_Report.pdf"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

@router.get("/schemes/excel")
def export_schemes_excel(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    schemes = db.query(Scheme).all()
    excel_bytes = generate_schemes_excel(schemes)
    log_report(db, "Public Schemes Dataset", "Scheme Dataset", "Excel", current_user)

    headers = {'Content-Disposition': 'attachment; filename="PolicyGPT_Public_Schemes_Report.xlsx"'}
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )

@router.get("/department/pdf")
def export_department_pdf(
    dept: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    dept_name = dept or (current_user.department if current_user and current_user.department else "Department of Agriculture")
    policies = db.query(Policy).filter(Policy.department.ilike(f"%{dept_name}%")).all()
    schemes = db.query(Scheme).join(Policy, isouter=True).filter(
        or_(Policy.department.ilike(f"%{dept_name}%"), Scheme.category == "Farmer Welfare")
    ).all()

    pdf_bytes = generate_department_pdf(dept_name, policies, schemes)
    log_report(db, f"Department Report - {dept_name}", "Department Report", "PDF", current_user)

    headers = {'Content-Disposition': f'attachment; filename="PolicyGPT_Department_{dept_name.replace(" ", "_")}_Report.pdf"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

@router.get("/analytics/pdf")
def export_analytics_pdf(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    from app.api.v1.analytics import get_admin_overview
    overview = get_admin_overview(db=db, current_user=current_user or User(role="Administrator"))
    pdf_bytes = generate_analytics_pdf(overview)
    log_report(db, "Executive Analytics Report", "Executive Summary", "PDF", current_user)

    headers = {'Content-Disposition': 'attachment; filename="PolicyGPT_Executive_Analytics_Report.pdf"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

