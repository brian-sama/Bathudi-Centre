from rest_framework import serializers
from .models import (
    Course, CourseRequirement, Application, Student, 
    TeamMember, GalleryImage, Newsletter, NewsPost,
    DirectorMessage, Testimonial, Video
)
import os

class CourseSerializer(serializers.ModelSerializer):
    course_pdf_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'short_title',
            'description',
            'short_description',
            'duration',
            'credits',
            'deposit_amount',
            'monthly_payment',
            'total_payment',
            'assessment_fee',
            'fee',
            'registration_fee',
            'level',
            'curriculum',
            'prerequisites',
            'requirements',
            'career_opportunities',
            'course_pdf_url',
            'image',
            'image_url',
            'is_math_required',
            'is_featured',
            'is_active',
            'display_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_course_pdf_url(self, obj):
        return obj.get_course_pdf_url
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url

class CourseRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseRequirement
        fields = ['id', 'course', 'type', 'description', 'is_required', 'order']

# ========== APPLICATION DOCUMENT SERIALIZERS ==========
class DocumentInfoSerializer(serializers.Serializer):
    """Serializer for document information"""
    url = serializers.CharField()
    name = serializers.CharField()
    size = serializers.IntegerField()
    uploaded_at = serializers.DateTimeField()

class ApplicationDocumentsSerializer(serializers.ModelSerializer):
    """Serializer specifically for application documents"""
    id_document = serializers.SerializerMethodField()
    matric_certificate = serializers.SerializerMethodField()
    proof_of_payment = serializers.SerializerMethodField()
    additional_doc_1 = serializers.SerializerMethodField()
    additional_doc_2 = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = [
            'id', 'name', 'surname', 'course_title',
            'id_document', 'matric_certificate', 'proof_of_payment',
            'additional_doc_1', 'additional_doc_2'
        ]
    
    def get_document_info(self, obj, field_name):
        """Helper method to get document information"""
        doc = getattr(obj, field_name, None)
        if doc and hasattr(doc, 'url'):
            request = self.context.get('request')
            return {
                'url': request.build_absolute_uri(doc.url) if request else doc.url,
                'name': os.path.basename(doc.name),
                'size': doc.size if hasattr(doc, 'size') else 0,
                'uploaded_at': obj.applied_date
            }
        return None
    
    def get_id_document(self, obj):
        return self.get_document_info(obj, 'id_document')
    
    def get_matric_certificate(self, obj):
        return self.get_document_info(obj, 'matric_certificate')
    
    def get_proof_of_payment(self, obj):
        return self.get_document_info(obj, 'proof_of_payment')
    
    def get_additional_doc_1(self, obj):
        return self.get_document_info(obj, 'additional_doc_1')
    
    def get_additional_doc_2(self, obj):
        return self.get_document_info(obj, 'additional_doc_2')

class ApplicationSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True, allow_null=True)
    formatted_date = serializers.SerializerMethodField()
    documents_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = [
            'id', 'name', 'surname', 'age', 'country', 'mobile', 'email',
            'id_number', 'address', 'education_level', 'previous_school', 
            'course', 'form_course_id', 'course_title', 'qualification', 'experience', 
            'message', 'id_document', 'matric_certificate', 'proof_of_payment',
            'additional_doc_1', 'additional_doc_2', 'status', 'fee_verified',
            'applied_date', 'formatted_date', 'documents_status', 'notes'
        ]
        read_only_fields = ['applied_date', 'formatted_date', 'documents_status']
    
    def get_formatted_date(self, obj):
        return obj.formatted_date
    
    def get_documents_status(self, obj):
        return obj.documents_status
    
    def validate(self, data):
        """Validate and map course data - FIXED"""
        print(f"🔍 Serializer validate - raw data: {data}")
        
        # Handle form_course_id that we set in the view
        form_course_id = data.get('form_course_id', '')
        
        if form_course_id:
            print(f"🔍 Found form_course_id: {form_course_id}")
            
            # Map form course IDs to actual Course titles
            course_mapping = {
                'automotive_engine_repairer': 'Automotive Engine Repairer',
                'automotive_clutch_brake_repairer': 'Automotive Clutch and Brake Repairer',
                'automotive_suspension_fitter': 'Automotive Suspension Fitter',
                'automotive_workshop_assistant': 'Automotive Workshop Assistant',
            }
            
            if form_course_id in course_mapping:
                course_title = course_mapping[form_course_id]
                try:
                    # Try contains first
                    course = Course.objects.filter(title__icontains=course_title).first()
                    
                    # If not found, try exact match
                    if not course:
                        course = Course.objects.filter(title=course_title).first()
                    
                    if course:
                        data['course'] = course
                        data['course_title'] = course.title
                        print(f"✅ SUCCESS: Mapped to course: {course.title} (ID: {course.id})")
                    else:
                        print(f"⚠️ WARNING: No course found matching: {course_title}")
                        
                        # List all available courses for debugging
                        all_courses = Course.objects.all()
                        print(f"📚 Available courses: {[c.title for c in all_courses]}")
                except Exception as e:
                    print(f"❌ Error mapping course: {e}")
        
        # Set default status
        data['status'] = 'pending'
        data['fee_verified'] = False
        
        return data

class ApplicationDetailSerializer(serializers.ModelSerializer):
    """Detailed application serializer with full document info"""
    course = CourseSerializer(read_only=True)
    formatted_date = serializers.SerializerMethodField()
    documents_status = serializers.SerializerMethodField()
    id_document_info = serializers.SerializerMethodField()
    matric_certificate_info = serializers.SerializerMethodField()
    proof_of_payment_info = serializers.SerializerMethodField()
    additional_doc_1_info = serializers.SerializerMethodField()
    additional_doc_2_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Application
        fields = '__all__'
    
    def get_formatted_date(self, obj):
        return obj.formatted_date
    
    def get_documents_status(self, obj):
        return obj.documents_status
    
    def get_document_info(self, obj, field_name):
        """Helper method to get document information"""
        doc = getattr(obj, field_name, None)
        if doc and hasattr(doc, 'url'):
            request = self.context.get('request')
            return {
                'url': request.build_absolute_uri(doc.url) if request else doc.url,
                'name': os.path.basename(doc.name),
                'size': doc.size if hasattr(doc, 'size') else 0,
            }
        return None
    
    def get_id_document_info(self, obj):
        return self.get_document_info(obj, 'id_document')
    
    def get_matric_certificate_info(self, obj):
        return self.get_document_info(obj, 'matric_certificate')
    
    def get_proof_of_payment_info(self, obj):
        return self.get_document_info(obj, 'proof_of_payment')
    
    def get_additional_doc_1_info(self, obj):
        return self.get_document_info(obj, 'additional_doc_1')
    
    def get_additional_doc_2_info(self, obj):
        return self.get_document_info(obj, 'additional_doc_2')

class StudentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True, allow_null=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'application', 'user', 'student_id', 'name', 'surname',
            'email', 'phone', 'course', 'course_title', 'enrollment_date',
            'completion_date', 'status', 'certificate_id', 'address'
        ]
        read_only_fields = ['enrollment_date', 'student_id']

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ['id', 'name', 'position', 'bio', 'email', 'phone', 
                 'image', 'order', 'is_active', 'facebook', 'twitter', 'linkedin']

class GalleryImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = GalleryImage
        fields = ['id', 'title', 'description', 'image', 'image_url', 'category', 
                 'upload_date', 'is_active']
        read_only_fields = ['upload_date']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ['id', 'email', 'subscribed_at', 'is_active']
        read_only_fields = ['subscribed_at']

class NewsPostSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = NewsPost
        fields = ['id', 'title', 'preview_text', 'content', 'image', 'image_url',
                 'is_published', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'image_url']
    
    def get_image_url(self, obj):
        """Generate full URL for the image"""
        if obj.image and hasattr(obj.image, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class DirectorMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DirectorMessage
        fields = ['id', 'quote', 'video_file', 'video_url', 'is_active', 
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class TestimonialSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True, allow_null=True)
    
    class Meta:
        model = Testimonial
        fields = ['id', 'student_name', 'course', 'course_title', 'content', 
                 'rating', 'is_featured', 'created_at']
        read_only_fields = ['created_at']

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Video
        fields = ['id', 'title', 'description', 'video_file', 'video_url', 
                 'thumbnail', 'is_active', 'created_at']
        read_only_fields = ['created_at']