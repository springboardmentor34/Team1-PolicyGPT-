import io
from typing import List
import openpyxl
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.models.models import Policy, Scheme

def generate_policies_pdf(policies: List[Policy]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#003366'),
        spaceAfter=12
    )
    story.append(Paragraph("PolicyGPT - Official Government Policy Intelligence Report", title_style))
    story.append(Spacer(1, 12))

    data = [["Code", "Policy Title", "Category", "Ministry", "Status", "State"]]
    for p in policies:
        data.append([
            p.code,
            p.title[:35] + ("..." if len(p.title) > 35 else ""),
            p.category,
            p.ministry[:25] + ("..." if len(p.ministry) > 25 else ""),
            p.status,
            p.state
        ])

    table = Table(data, colWidths=[80, 150, 90, 110, 60, 60])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003366')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#F8F9FA')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CCCCCC')),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))
    story.append(table)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

def generate_schemes_excel(schemes: List[Scheme]) -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Public Schemes Report"

    headers = ["ID", "Code", "Scheme Name", "Category", "Financial Assistance", "Budget Allocated (₹)", "Status", "Target Group", "Deadline"]
    ws.append(headers)

    # Style header row
    for col_num in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_num)
        cell.font = openpyxl.styles.Font(bold=True, color="FFFFFF")
        cell.fill = openpyxl.styles.PatternFill(start_color="003366", end_color="003366", fill_type="solid")

    for s in schemes:
        ws.append([
            s.id,
            s.code,
            s.name,
            s.category,
            s.financial_assistance or "N/A",
            float(s.budget_allocated) if s.budget_allocated else 0.0,
            s.status,
            s.target_group or "N/A",
            str(s.deadline) if s.deadline else "N/A"
        ])

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()
