# core/management/commands/seed_courses.py
import os
from django.core.management.base import BaseCommand
from core.models import Course, CourseRequirement

class Command(BaseCommand):
    help = 'Seed the database with initial courses matching the PDFs and application form'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('🌱 SEEDING COURSES DATABASE'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        
        courses_data = [
            {
                'id': 1,
                'title': 'Occupational Certificate: Automotive Engine Repairer',
                'short_title': 'Engine Repairer',
                'description': 'Comprehensive training program focused on automotive engine repair, diagnosis, and overhaul. Students learn to diagnose engine problems, perform repairs, and conduct engine testing procedures.',
                'short_description': 'Master automotive engine repair and diagnostics',
                'duration': '6 months',
                'credits': 80,
                'deposit_amount': 4416.67,
                'monthly_payment': 1472.22,
                'total_payment': 17633.33,
                'assessment_fee': 441.67,
                'fee': 17633.33,
                'registration_fee': 200.00,
                'level': 'intermediate',
                'curriculum': 'Module 1: Engine Fundamentals\n- Engine types and classifications\n- 4-stroke and 2-stroke principles\n- Engine components and functions\n\nModule 2: Engine Diagnosis\n- Diagnostic equipment\n- Symptom analysis\n- Compression and leak-down testing\n\nModule 3: Engine Repair\n- Cylinder head repair\n- Block repair\n- Crankshaft and camshaft service\n\nModule 4: Engine Assembly\n- Assembly procedures\n- Torque specifications\n- Timing and adjustments\n\nModule 5: Engine Testing\n- Performance testing\n- Oil pressure testing\n- Vacuum testing',
                'prerequisites': 'Grade 11 or equivalent. Basic understanding of mechanical systems.',
                'requirements': 'Certified ID copy, Grade 11/Matric certificate, Registration fee of R661.25',
                'career_opportunities': 'Engine Repair Technician, Workshop Assistant, Service Technician, Automotive Mechanic',
                'course_pdf_url': '/pdfs/course-outlines/Automotive Engine Repairer.pdf',
                'is_math_required': False,
                'is_featured': True,
                'is_active': True,
                'display_order': 1,
                # IMPORTANT: This matches the value sent from the React form
                'form_course_id': 'automotive_engine_repairer',
            },
            {
                'id': 2, 
                'title': 'Occupational Certificate: Automotive Clutch and Brake Repairer',
                'short_title': 'Clutch & Brake',
                'description': 'Specialized training program focusing on automotive clutch and brake systems. Covers diagnosis, repair, and maintenance of braking systems, clutch assemblies, and related hydraulic components.',
                'short_description': 'Specialize in clutch and brake system repair',
                'duration': '5 months',
                'credits': 70,
                'deposit_amount': 3677.78,
                'monthly_payment': 1225.93,
                'total_payment': 14666.67,
                'assessment_fee': 367.78,
                'fee': 14666.67,
                'registration_fee': 200.00,
                'level': 'beginner',
                'curriculum': 'Module 1: Brake System Fundamentals\n- Hydraulic brake systems\n- Disc and drum brakes\n- Master cylinders and calipers\n\nModule 2: ABS and Electronic Brakes\n- ABS components\n- Electronic brake distribution\n- Traction control\n\nModule 3: Clutch Systems\n- Manual transmission clutches\n- Hydraulic clutch systems\n- Clutch adjustment\n\nModule 4: Diagnosis and Repair\n- Brake system diagnosis\n- Clutch system troubleshooting\n- Component replacement\n\nModule 5: Safety and Testing\n- Brake testing procedures\n- Safety standards\n- Quality control',
                'prerequisites': 'Grade 10 certificate. Attention to detail for safety-critical systems.',
                'requirements': 'Certified ID copy, Grade 10 certificate, Registration fee of R661.25',
                'career_opportunities': 'Brake Technician, Clutch Specialist, Automotive Repairer, Service Technician',
                'course_pdf_url': '/pdfs/course-outlines/Automotive Clutch and Brake Repairer.pdf',
                'is_math_required': False,
                'is_featured': True,
                'is_active': True,
                'display_order': 2,
                # IMPORTANT: This matches the value sent from the React form
                'form_course_id': 'automotive_clutch_brake_repairer',
            },
            {
                'id': 3,
                'title': 'Occupational Certificate: Automotive Suspension Fitter',
                'short_title': 'Suspension Fitter',
                'description': 'Specialized training program focusing on automotive suspension systems, steering components, and wheel alignment. Students learn to diagnose, repair, and maintain suspension systems for various vehicle types.',
                'short_description': 'Become an expert in suspension and steering systems',
                'duration': '6 months',
                'credits': 80,
                'deposit_amount': 4416.67,
                'monthly_payment': 1472.22,
                'total_payment': 17633.33,
                'assessment_fee': 441.67,
                'fee': 17633.33,
                'registration_fee': 200.00,
                'level': 'intermediate',
                'curriculum': 'Module 1: Suspension Fundamentals\n- Suspension types and designs\n- Shock absorbers and struts\n- Springs and stabilizers\n\nModule 2: Steering Systems\n- Manual and power steering\n- Steering linkage\n- Steering geometry\n\nModule 3: Wheel Alignment\n- Alignment principles\n- 4-wheel alignment\n- Adjustment procedures\n\nModule 4: Advanced Suspension\n- Air suspension\n- Electronic suspension\n- Performance suspension\n\nModule 5: Diagnosis and Repair\n- Suspension troubleshooting\n- Component replacement\n- System testing',
                'prerequisites': 'Grade 11 certificate. Basic automotive knowledge.',
                'requirements': 'Certified ID copy, Grade 11/Matric certificate, Registration fee of R661.25',
                'career_opportunities': 'Suspension Technician, Wheel Alignment Specialist, Automotive Repairer, Chassis Specialist',
                'course_pdf_url': '/pdfs/course-outlines/Automotive Suspension Fitter.pdf',
                'is_math_required': True,
                'is_featured': True,
                'is_active': True,
                'display_order': 3,
                # IMPORTANT: This matches the value sent from the React form
                'form_course_id': 'automotive_suspension_fitter',
            },
            {
                'id': 4,
                'title': 'Occupational Certificate: Automotive Workshop Assistant',
                'short_title': 'Workshop Assistant',
                'description': 'Foundational training program for automotive workshop operations. Covers workshop safety, basic maintenance, tool usage, and assistance procedures for automotive repair and maintenance.',
                'short_description': 'Start your career as an automotive workshop assistant',
                'duration': '4 months',
                'credits': 60,
                'deposit_amount': 2944.44,
                'monthly_payment': 981.48,
                'total_payment': 11733.33,
                'assessment_fee': 294.44,
                'fee': 11733.33,
                'registration_fee': 200.00,
                'level': 'beginner',
                'curriculum': 'Module 1: Workshop Basics\n- Workshop safety procedures\n- Tool identification and usage\n- Workshop organization\n\nModule 2: Vehicle Maintenance\n- Basic maintenance procedures\n- Fluid checks and changes\n- Tire service and repair\n\nModule 3: Assistance Skills\n- Technician assistance\n- Parts handling and identification\n- Customer service basics\n\nModule 4: Workshop Operations\n- Inventory management\n- Workshop cleaning\n- Safety compliance\n\nModule 5: Basic Repairs\n- Simple repairs and adjustments\n- Component replacement\n- Quality checks',
                'prerequisites': 'No prior experience required. Interest in automotive work.',
                'requirements': 'Certified ID copy, Grade 9 certificate, Registration fee of R661.25',
                'career_opportunities': 'Workshop Assistant, Maintenance Assistant, Service Helper, Automotive Apprentice',
                'course_pdf_url': '/pdfs/course-outlines/Automotive Workshop Assistant.pdf',
                'is_math_required': False,
                'is_featured': True,
                'is_active': True,
                'display_order': 4,
                # IMPORTANT: This matches the value sent from the React form
                'form_course_id': 'automotive_workshop_assistant',
            }
        ]

        created_count = 0
        updated_count = 0
        error_count = 0

        for course_data in courses_data:
            try:
                # Extract form_course_id for mapping reference
                form_course_id = course_data.pop('form_course_id')
                
                # Check if course already exists
                course, created = Course.objects.update_or_create(
                    id=course_data['id'],
                    defaults=course_data
                )
                
                if created:
                    self.stdout.write(self.style.SUCCESS(f'  ✅ CREATED: {course.title}'))
                    created_count += 1
                else:
                    self.stdout.write(self.style.WARNING(f'  🔄 UPDATED: {course.title}'))
                    updated_count += 1
                
                # Create course requirements
                requirements = [
                    {
                        'type': 'id_copy',
                        'description': 'Certified copy of ID document',
                        'is_required': True,
                        'order': 1
                    },
                    {
                        'type': 'matric',
                        'description': f'{course_data.get("prerequisites", "School certificate")} certificate',
                        'is_required': True,
                        'order': 2
                    },
                    {
                        'type': 'fee',
                        'description': f'Registration fee of R{course_data.get("registration_fee", 661.25)}',
                        'is_required': True,
                        'order': 3
                    }
                ]
                
                # Add math requirement if needed
                if course_data.get('is_math_required', False):
                    requirements.append({
                        'type': 'maths',
                        'description': 'Mathematics minimum requirement',
                        'is_required': True,
                        'order': 4
                    })
                
                # Add other requirements
                requirements.append({
                    'type': 'other',
                    'description': 'Valid driver\'s license recommended',
                    'is_required': False,
                    'order': 5
                })
                
                # Update or create requirements
                for req_data in requirements:
                    req, req_created = CourseRequirement.objects.update_or_create(
                        course=course,
                        type=req_data['type'],
                        defaults={
                            'description': req_data['description'],
                            'is_required': req_data['is_required'],
                            'order': req_data['order']
                        }
                    )
                    
                self.stdout.write(f'     📋 Added requirements for: {course.short_title}')
                
                # Print mapping info
                self.stdout.write(f'     🔗 Form ID: "{form_course_id}" → Course ID: {course.id}')
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ❌ ERROR with {course_data["title"]}: {str(e)}'))
                error_count += 1

        # Summary
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('📊 SEEDING COMPLETE'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS(f'  ✅ Created: {created_count} courses'))
        self.stdout.write(self.style.SUCCESS(f'  🔄 Updated: {updated_count} courses'))
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'  ❌ Errors: {error_count} courses'))
        else:
            self.stdout.write(self.style.SUCCESS(f'  ✅ Errors: 0'))
        
        self.stdout.write('=' * 60)
        
        # Display course mapping reference
        self.stdout.write(self.style.SUCCESS('\n📋 COURSE MAPPING REFERENCE:'))
        self.stdout.write('=' * 60)
        self.stdout.write(f'{"Form Course ID":<35} {"→ Course Title":<50}')
        self.stdout.write('-' * 85)
        
        courses = Course.objects.all().order_by('id')
        mapping = {
            'automotive_engine_repairer': 'Occupational Certificate: Automotive Engine Repairer',
            'automotive_clutch_brake_repairer': 'Occupational Certificate: Automotive Clutch and Brake Repairer',
            'automotive_suspension_fitter': 'Occupational Certificate: Automotive Suspension Fitter',
            'automotive_workshop_assistant': 'Occupational Certificate: Automotive Workshop Assistant',
        }
        
        for form_id, title in mapping.items():
            course = Course.objects.filter(title__icontains=title.replace('Occupational Certificate: ', '')).first()
            if course:
                self.stdout.write(f'{form_id:<35} → {course.title:<50}')
                self.stdout.write(f'{" ":<35}   (ID: {course.id})')
            else:
                self.stdout.write(self.style.WARNING(f'{form_id:<35} → ⚠️ Course not found'))
        
        self.stdout.write('=' * 60)
        self.stdout.write(self.style.SUCCESS('\n✅ Course seeding completed successfully!'))
        self.stdout.write('=' * 60)