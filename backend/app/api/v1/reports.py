from typing import Optional
from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Policy, Scheme, User, Report
from app.services.report_service import generate_policies_pdf, generate_schemes_excel
from app.api.deps import require_authenticated_user

router = APIRouter(prefix="/reports", tags=["Reports & Export Module"])

@router.get("/policies/pdf")
def export_policies_pdf(db: Session = Depends(get_db)):
    policies = db.query(Policy).all()
    pdf_bytes = generate_policies_pdf(policies)
    
    headers = {'Content-Disposition': 'attachment; filename="PolicyGPT_Policies_Report.pdf"'}
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)

@router.get("/schemes/excel")
def export_schemes_excel(db: Session = Depends(get_db)):
    schemes = db.query(Scheme).all()
    excel_bytes = generate_schemes_excel(schemes)

    headers = {'Content-Disposition': 'attachment; filename="PolicyGPT_Public_Schemes_Report.xlsx"'}
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )
