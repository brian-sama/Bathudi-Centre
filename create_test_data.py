import os
import django
import sys

# Add your project to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bathuditraining2center.settings')
django.setup()

from core.models import Course, Application
from django.core.files import File
import random

def create_test_data():
    # Create courses
    courses_data = [
        {
            'title': 'Automotive Suspension Repairer',
            'description': 'Learn advanced suspension systems repair and maintenance.',
            'duration': '6 months',
            'saqa_id': 'SAQA12345',
            'credits': 120
        },
        {
            'title': 'Clutch & Brake Repairer',
            'description': 'Specialize in clutch and brake system diagnostics and repair.',
            'duration': '5 months',
            'saqa_id': 'SAQA12346',
            'credits': 100
        },
        {
            'title': 'Engine Fitter',
            'description': 'Comprehensive engine assembly and fitting training.',
            'duration': '8 months',
            'saqa_id': 'SAQA12347',
            'credits': 150
        },
        {
            'title': 'Workshop Assistant',
            'description': 'Basic automotive workshop operations and assistance.',
            'duration': '4 months',
            'saqa_id': 'SAQA12348',
            'credits': 80
        }
    ]
    
    courses = []
    for course_data in courses_data:
        course, created = Course.objects.get_or_create(
            title=course_data['title'],
            defaults=course_data
        )
        courses.append(course)
        print(f"Course: {course.title} {'created' if created else 'exists'}")
    
    # Create test applications
    applicants = [
        {
            'name': 'Lerato',
            'surname': 'Zulu',
            'age': 19,
            'mobile': '+27 72 123 4567',
            'education_level': 'Grade 12',
            'previous_school': 'Soweto High School',
            'course': courses[0],  # Automotive Suspension
            'country': 'South Africa'
        },
        {
            'name': 'Thabo',
            'surname': 'Kumalo',
            'age': 21,
            'mobile': '+27 83 987 6543',
            'education_level': 'Grade 12',
            'previous_school': 'Alexandra Secondary',
            'course': courses[1],  # Clutch & Brake
            'country': 'South Africa'
        },
        {
            'name': 'Kobus',
            'surname': 'van Wyk',
            'age': 22,
            'mobile': '+27 64 555 1234',
            'education_level': 'Grade 12',
            'previous_school': 'Pretoria Boys High',
            'course': courses[2],  # Engine Fitter
            'country': 'South Africa'
        },
        {
            'name': 'Nomsa',
            'surname': 'Mbatha',
            'age': 20,
            'mobile': '+27 71 234 5678',
            'education_level': 'Grade 12',
            'previous_school': 'Durban Girls College',
            'course': courses[3],  # Workshop Assistant
            'country': 'South Africa'
        }
    ]
    
    for i, applicant_data in enumerate(applicants):
        app, created = Application.objects.get_or_create(
            name=applicant_data['name'],
            surname=applicant_data['surname'],
            defaults={
                **applicant_data,
                'status': 'Pending',
                'fee_verified': i % 2 == 0  # Alternate fee verification
            }
        )
        print(f"Application: {app.name} {app.surname} - {app.course.title} {'created' if created else 'exists'}")
    
    print("\n✅ Test data created successfully!")
    print(f"Total Courses: {Course.objects.count()}")
    print(f"Total Applications: {Application.objects.count()}")
    print(f"Pending Applications: {Application.objects.filter(status='Pending').count()}")

if __name__ == '__main__':
    create_test_data()