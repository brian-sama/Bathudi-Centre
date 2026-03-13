import os
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from django.utils import timezone

# ========== FILE UPLOAD PATHS ==========
def id_document_upload_path(instance, filename):
    """Upload path for ID documents following the requested structure"""
    return f'applications/id/id_documents/{timezone.now().year}/{timezone.now().month:02d}/{timezone.now().day:02d}/{filename}'

def matric_certificate_upload_path(instance, filename):
    """Upload path for matric certificates following the requested structure"""
    return f'applications/matric/matric_certificates/{timezone.now().year}/{timezone.now().month:02d}/{timezone.now().day:02d}/{filename}'

def proof_of_payment_upload_path(instance, filename):
    """Upload path for proof of payment following the requested structure"""
    return f'applications/pop/proof_of_payments/{timezone.now().year}/{timezone.now().month:02d}/{timezone.now().day:02d}/{filename}'

def additional_document_upload_path(instance, filename):
    """Upload path for additional documents"""
    return f'applications/additional/{instance.document_type}/{timezone.now().year}/{timezone.now().month:02d}/{timezone.now().day:02d}/{filename}'

# ========== COURSE MODELS ==========
class Course(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    title = models.CharField(max_length=200)
    short_title = models.CharField(max_length=100, blank=True, help_text="Short title for display")
    description = models.TextField()
    short_description = models.CharField(max_length=300, blank=True, help_text="Short description for cards")
    duration = models.CharField(max_length=100, help_text="e.g., 3 months, 6 weeks, 9 months")
    
    # Detailed fee fields
    credits = models.IntegerField(default=0, help_text="Number of credits for the course")
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=6612.50, help_text="Deposit amount")
    monthly_payment = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Monthly payment amount")
    total_payment = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Total payment for the course")
    assessment_fee = models.DecimalField(max_digits=10, decimal_places=2, default=661.25, help_text="Assessment fee")
    
    # Old fee fields (kept for compatibility)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=200.00, help_text="Non-refundable registration fee")
    
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    
    # Course details for display
    curriculum = models.TextField(help_text="Course curriculum/syllabus", blank=True)
    prerequisites = models.TextField(blank=True)
    requirements = models.TextField(blank=True, help_text="Admission requirements")
    career_opportunities = models.TextField(blank=True, help_text="Career opportunities after completion")
    
    # PDF download for course outline
    course_pdf = models.FileField(upload_to='course_pdfs/', blank=True, null=True, help_text="PDF file with full course details")
    course_pdf_url = models.CharField(max_length=500, blank=True, help_text="External PDF URL or static file path")
    
    # Status and display
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_math_required = models.BooleanField(default=False, help_text="Mathematics required for this course?")
    
    # Images
    image = models.ImageField(upload_to='courses/', blank=True, null=True)
    image_url = models.URLField(blank=True, help_text="External image URL if not uploading")
    
    # Metadata
    display_order = models.IntegerField(default=0, help_text="Order in which courses are displayed")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['display_order', '-created_at']
    
    @property
    def get_image(self):
        """Get image URL - prefer uploaded image over URL"""
        if self.image:
            return self.image.url
        return self.image_url or 'https://picsum.photos/400/600'
    
    @property
    def get_course_pdf_url(self):
        """Get course PDF URL - prefer uploaded file over URL"""
        if self.course_pdf:
            return self.course_pdf.url
        elif self.course_pdf_url:
            if self.course_pdf_url.startswith('/'):
                return f'http://localhost:8000{self.course_pdf_url}'
            return self.course_pdf_url
        return None

class CourseRequirement(models.Model):
    """Individual requirements for courses (for the 4-box display)"""
    REQUIREMENT_TYPE_CHOICES = [
        ('id_copy', 'Certified ID Copy'),
        ('matric', 'Matric/School Certificate'),
        ('fee', 'Registration Fee'),
        ('maths', 'Mathematics'),
        ('other', 'Other'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='requirements_list')
    type = models.CharField(max_length=50, choices=REQUIREMENT_TYPE_CHOICES)
    description = models.CharField(max_length=200)
    is_required = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.course.title} - {self.get_type_display()}"
    
    class Meta:
        ordering = ['order']

# ========== APPLICATION MODEL ==========
class Application(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('contacted', 'Contacted'),
    ]
    
    EDUCATION_LEVELS = [
        ('Grade 10', 'Grade 10'),
        ('Grade 11', 'Grade 11'),
        ('Grade 12 (Matric)', 'Grade 12 (Matric)'),
        ('N3', 'N3'),
        ('N4', 'N4'),
        ('N5', 'N5'),
        ('N6', 'N6'),
        ('Certificate', 'Certificate'),
        ('Diploma', 'Diploma'),
        ('Degree', 'Degree'),
        ('Other', 'Other Qualification'),
    ]
    
    COUNTRIES = [
        ('South Africa', 'South Africa'),
        ('Lesotho', 'Lesotho'),
        ('Botswana', 'Botswana'),
        ('Eswatini', 'Eswatini'),
        ('Namibia', 'Namibia'),
        ('Zimbabwe', 'Zimbabwe'),
        ('Mozambique', 'Mozambique'),
        ('Zambia', 'Zambia'),
        ('Other African Country', 'Other African Country'),
        ('International', 'International'),
    ]
    
    # Personal Information
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    age = models.IntegerField()
    country = models.CharField(max_length=100, choices=COUNTRIES, default='South Africa')
    mobile = models.CharField(max_length=20)
    email = models.EmailField()
    id_number = models.CharField(max_length=50, blank=True, null=True, help_text="ID or Passport number")
    address = models.TextField(blank=True, help_text="Physical address")
    
    # Education Information
    education_level = models.CharField(max_length=200, blank=True)
    previous_school = models.CharField(max_length=200, blank=True)
    
    # Course selection
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='applications', null=True, blank=True)
    course_title = models.CharField(max_length=200, blank=True, help_text="Full course title")
    form_course_id = models.CharField(max_length=100, blank=True, help_text="Course ID from the form")
    
    # Additional fields
    qualification = models.TextField(blank=True)
    experience = models.TextField(blank=True, help_text="Previous experience if any")
    message = models.TextField(blank=True, help_text="Why do you want to join this course?")
    rejection_reason = models.TextField(blank=True, null=True, help_text="Reason for rejection")
    
    # Document fields - FIXED: Using proper upload paths
    id_document = models.FileField(
        upload_to=id_document_upload_path,
        validators=[FileExtensionValidator(['pdf', 'jpg', 'jpeg', 'png'])],
        blank=True,
        null=True
    )
    matric_certificate = models.FileField(
        upload_to=matric_certificate_upload_path,
        validators=[FileExtensionValidator(['pdf', 'jpg', 'jpeg', 'png'])],
        blank=True,
        null=True
    )
    proof_of_payment = models.FileField(
        upload_to=proof_of_payment_upload_path,
        validators=[FileExtensionValidator(['pdf', 'jpg', 'jpeg', 'png'])],
        blank=True,
        null=True
    )
    additional_doc_1 = models.FileField(
        upload_to='applications/additional_docs/%Y/%m/%d/',
        validators=[FileExtensionValidator(['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'])],
        blank=True,
        null=True
    )
    additional_doc_2 = models.FileField(
        upload_to='applications/additional_docs/%Y/%m/%d/',
        validators=[FileExtensionValidator(['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'])],
        blank=True,
        null=True
    )
    
    # Status fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    fee_verified = models.BooleanField(default=False)
    applied_date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, help_text="Admin notes")
    
    def save(self, *args, **kwargs):
        """Save application with course mapping - FIXED"""
        print(f"🔍 Application.save() - Course: {self.course}, form_course_id: {self.form_course_id}")
        
        # Try to find course by form_course_id if course is not set
        if not self.course and self.form_course_id:
            try:
                # Map form course IDs to actual Course objects
                course_mapping = {
                    'automotive_engine_repairer': 'Automotive Engine Repairer',
                    'automotive_clutch_brake_repairer': 'Automotive Clutch and Brake Repairer',
                    'automotive_suspension_fitter': 'Automotive Suspension Fitter',
                    'automotive_workshop_assistant': 'Automotive Workshop Assistant',
                }
                
                if self.form_course_id in course_mapping:
                    course_title = course_mapping[self.form_course_id]
                    print(f"🔍 Looking for course with title containing: {course_title}")
                    
                    # Try contains first
                    course = Course.objects.filter(title__icontains=course_title).first()
                    
                    # If not found, try exact match
                    if not course:
                        course = Course.objects.filter(title=course_title).first()
                    
                    if course:
                        self.course = course
                        self.course_title = course.title
                        print(f"✅ SUCCESS: Set course to: {course.title} (ID: {course.id})")
                    else:
                        print(f"⚠️ WARNING: No course found for: {course_title}")
                        
                        # List all available courses for debugging
                        all_courses = Course.objects.all()
                        print(f"📚 Available courses: {[c.title for c in all_courses]}")
            except Exception as e:
                print(f"❌ Error in save method: {e}")
        
        # Automatically set course_title from course if not set
        if not self.course_title and self.course:
            self.course_title = self.course.title
            print(f"📝 Set course_title from course: {self.course_title}")
        
        super().save(*args, **kwargs)
        print(f"✅ Application {self.id} saved with course: {self.course}")
    
    @property
    def documents_status(self):
        """Return dictionary of document upload status"""
        return {
            'id': bool(self.id_document),
            'matric': bool(self.matric_certificate),
            'pop': bool(self.proof_of_payment),
            'additional_1': bool(self.additional_doc_1),
            'additional_2': bool(self.additional_doc_2),
        }
    
    @property
    def formatted_date(self):
        """Return formatted application date"""
        return self.applied_date.strftime('%d %b %Y, %H:%M')
    
    def get_document_url(self, document_field):
        """Get full URL for a document"""
        doc = getattr(self, document_field, None)
        if doc and hasattr(doc, 'url'):
            return doc.url
        return None
    
    def get_document_info(self, document_field, request=None):
        """Get document information with full URL"""
        doc = getattr(self, document_field, None)
        if doc and hasattr(doc, 'name'):
            info = {
                'name': os.path.basename(doc.name),
                'size': doc.size if hasattr(doc, 'size') else 0,
                'uploaded_at': self.applied_date,
            }
            
            if hasattr(doc, 'url'):
                if request:
                    info['url'] = request.build_absolute_uri(doc.url)
                else:
                    info['url'] = doc.url
            return info
        return None
    
    def __str__(self):
        return f"{self.name} {self.surname} - {self.course_title or (self.course.title if self.course else 'No Course')}"
    
    class Meta:
        ordering = ['-applied_date']

class Student(models.Model):
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ]
    
    # Linking to application
    application = models.OneToOneField(Application, on_delete=models.SET_NULL, null=True, blank=True, related_name='student_record')
    
    # Student details
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile', null=True, blank=True)
    student_id = models.CharField(max_length=20, unique=True, blank=True)
    name = models.CharField(max_length=100)
    surname = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, related_name='students')
    
    # Enrollment details
    enrollment_date = models.DateField(auto_now_add=True)
    completion_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    certificate_id = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    
    def save(self, *args, **kwargs):
        if not self.student_id and self.application:
            self.student_id = f'STU{self.application.id:04d}'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.name} {self.surname} - {self.course.title if self.course else 'No Course'}"
    
    class Meta:
        ordering = ['-enrollment_date']

# ========== WEBSITE CONTENT MODELS ==========
class TeamMember(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    image = models.ImageField(upload_to='team/')
    order = models.IntegerField(default=0, help_text="Display order")
    is_active = models.BooleanField(default=True)
    facebook = models.URLField(blank=True)
    twitter = models.URLField(blank=True)
    linkedin = models.URLField(blank=True)
    
    def __str__(self):
        return f"{self.name} - {self.position}"
    
    class Meta:
        ordering = ['order', 'name']

class GalleryImage(models.Model):
    CATEGORY_CHOICES = [
        ('classroom', 'Classroom'),
        ('event', 'Event'),
        ('graduation', 'Graduation'),
        ('facility', 'Facility'),
        ('student_work', 'Student Work'),
    ]
    
    title = models.CharField(max_length=200, default='Untitled')
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='gallery/')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='event')
    upload_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-upload_date']

class Newsletter(models.Model):
    """For collecting user emails (subscription)"""
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.email
    
    class Meta:
        ordering = ['-subscribed_at']

class NewsPost(models.Model):
    """For campus updates/news posts"""
    title = models.CharField(max_length=200)
    preview_text = models.CharField(max_length=300, blank=True)
    content = models.TextField()
    image = models.ImageField(upload_to='news/', blank=True, null=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    @property
    def image_url(self):
        """Get the full URL for the image"""
        if self.image and hasattr(self.image, 'url'):
            return self.image.url
        return None
    
    class Meta:
        ordering = ['-created_at']

class DirectorMessage(models.Model):
    """Director's message with video"""
    quote = models.TextField()
    video_file = models.FileField(upload_to='videos/director/', blank=True, null=True)
    video_url = models.URLField(blank=True, help_text="YouTube or other video URL")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Director Message - {self.created_at.strftime('%Y-%m-%d')}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Director Messages"

class Testimonial(models.Model):
    student_name = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField()
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        default=5
    )
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student_name} - {self.rating} stars"
    
    class Meta:
        ordering = ['-created_at']

class Video(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_file = models.FileField(upload_to='videos/', blank=True, null=True, help_text="Upload video file")
    video_url = models.URLField(blank=True, help_text="YouTube or other video URL")
    thumbnail = models.ImageField(upload_to='videos/thumbnails/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']