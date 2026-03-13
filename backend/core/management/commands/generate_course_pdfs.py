import os
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from core.models import Course
from core.utils.pdf_generator import CoursePDFGenerator

class Command(BaseCommand):
    help = 'Generate PDFs for all courses that don\'t have them'

    def handle(self, *args, **options):
        courses = Course.objects.all()
        count = 0
        
        for course in courses:
            if not course.course_pdf:
                try:
                    # Generate PDF content
                    from core.views import CoursePDFGenerator
                    pdf_content = CoursePDFGenerator.generate_course_pdf(course)
                    
                    # Save to course_pdf field
                    filename = f"{course.title.lower().replace(' ', '-').replace('/', '-')}-outline.pdf"
                    course.course_pdf.save(filename, ContentFile(pdf_content), save=True)
                    
                    self.stdout.write(self.style.SUCCESS(f'Generated PDF for {course.title}'))
                    count += 1
                    
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error generating PDF for {course.title}: {str(e)}'))
        
        self.stdout.write(self.style.SUCCESS(f'Successfully generated {count} PDFs'))