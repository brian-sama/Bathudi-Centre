import os
from django.conf import settings
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime

class CoursePDFGenerator:
    @staticmethod
    def generate_course_pdf(course):
        """Generate a PDF for a course"""
        buffer = BytesIO()
        
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        story = []
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#1e40af')
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.HexColor('#1e40af')
        )
        
        story.append(Paragraph(f"{course.title}", title_style))
        story.append(Spacer(1, 10))
        
        details = [
            f"<b>Duration:</b> {course.duration}",
            f"<b>Level:</b> {course.get_level_display()}",
            f"<b>Credits:</b> {course.credits}",
            f"<b>Short Description:</b> {course.short_description}"
        ]
        
        for detail in details:
            story.append(Paragraph(detail, styles['Normal']))
            story.append(Spacer(1, 5))
        
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("Course Description", heading_style))
        story.append(Paragraph(course.description, styles['Normal']))
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("Fee Structure", heading_style))
        
        fee_data = [
            ['Item', 'Amount (ZAR)'],
            ['Deposit Amount', f"R{course.deposit_amount}"],
            ['Monthly Payment', f"R{course.monthly_payment}"],
            ['Total Payment', f"R{course.total_payment}"],
            ['Assessment Fee', f"R{course.assessment_fee}"],
            ['Registration Fee', f"R{course.registration_fee}"]
        ]
        
        fee_table = Table(fee_data, colWidths=[3*inch, 2*inch])
        fee_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e2e8f0')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        story.append(fee_table)
        story.append(Spacer(1, 20))
        
        if course.curriculum:
            story.append(Paragraph("Course Curriculum", heading_style))
            story.append(Paragraph(course.curriculum, styles['Normal']))
            story.append(Spacer(1, 20))
        
        if course.prerequisites:
            story.append(Paragraph("Prerequisites", heading_style))
            story.append(Paragraph(course.prerequisites, styles['Normal']))
            story.append(Spacer(1, 20))
        
        if course.requirements:
            story.append(Paragraph("Admission Requirements", heading_style))
            story.append(Paragraph(course.requirements, styles['Normal']))
            story.append(Spacer(1, 20))
        
        if course.career_opportunities:
            story.append(Paragraph("Career Opportunities", heading_style))
            story.append(Paragraph(course.career_opportunities, styles['Normal']))
            story.append(Spacer(1, 20))
        
        footer_text = f"Generated on {datetime.now().strftime('%Y-%m-%d %H:%M')} | Bathudi Training Center"
        story.append(Spacer(1, 40))
        story.append(Paragraph(footer_text, ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.gray,
            alignment=1
        )))
        
        doc.build(story)
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return pdf_content

class ApplicationPDFGenerator:
    @staticmethod
    def generate_application_pdf(application):
        """Generate PDF for an application"""
        buffer = BytesIO()
        
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        story = []
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'ApplicationTitle',
            parent=styles['Heading1'],
            fontSize=20,
            spaceAfter=30,
            textColor=colors.HexColor('#1e40af'),
            alignment=1
        )
        
        story.append(Paragraph("Application Form", title_style))
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("Personal Information", styles['Heading2']))
        
        personal_data = [
            ['Name:', f"{application.name} {application.surname}"],
            ['Age:', str(application.age)],
            ['Country:', application.country],
            ['Mobile:', application.mobile],
            ['Email:', application.email]
        ]
        
        for item in personal_data:
            story.append(Paragraph(f"<b>{item[0]}</b> {item[1]}", styles['Normal']))
            story.append(Spacer(1, 5))
        
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("Course Application", styles['Heading2']))
        story.append(Paragraph(f"<b>Course:</b> {application.course.title}", styles['Normal']))
        story.append(Spacer(1, 10))
        
        if application.education_level or application.previous_school:
            story.append(Paragraph("Educational Background", styles['Heading2']))
            if application.education_level:
                story.append(Paragraph(f"<b>Education Level:</b> {application.education_level}", styles['Normal']))
            if application.previous_school:
                story.append(Paragraph(f"<b>Previous School:</b> {application.previous_school}", styles['Normal']))
            story.append(Spacer(1, 20))
        
        if application.qualification:
            story.append(Paragraph("Qualifications", styles['Heading2']))
            story.append(Paragraph(application.qualification, styles['Normal']))
            story.append(Spacer(1, 20))
        
        if application.experience:
            story.append(Paragraph("Experience", styles['Heading2']))
            story.append(Paragraph(application.experience, styles['Normal']))
            story.append(Spacer(1, 20))
        
        if application.message:
            story.append(Paragraph("Application Message", styles['Heading2']))
            story.append(Paragraph(application.message, styles['Normal']))
            story.append(Spacer(1, 20))
        
        footer = Paragraph(
            f"Application ID: {application.id} | Applied: {application.applied_date.strftime('%Y-%m-%d %H:%M')} | Status: {application.get_status_display()}",
            ParagraphStyle('Footer', parent=styles['Normal'], fontSize=9, textColor=colors.gray)
        )
        story.append(footer)
        
        doc.build(story)
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return pdf_content