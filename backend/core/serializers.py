from difflib import SequenceMatcher

from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
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
            'requirements',
            'career_opportunities',
            'course_pdf_url',
            'image',
            'image_url',
            'is_math_required',
            'is_featured',
            'is_active',
            'display_order',
            'saqa_id',
            'nqf_level',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_course_pdf_url(self, obj):
        pdf_url = obj.get_course_pdf_url
        request = self.context.get('request')
        if pdf_url and request and pdf_url.startswith('/'):
            return request.build_absolute_uri(pdf_url)
        return pdf_url
    
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
            'applied_date', 'formatted_date', 'documents_status', 'notes', 'funding_type'
        ]
        read_only_fields = ['applied_date', 'formatted_date', 'documents_status']
    
    def get_formatted_date(self, obj):
        return obj.formatted_date
    
    def get_documents_status(self, obj):
        return obj.documents_status
    
    def validate(self, data):
        """Validate and map course data"""
        form_course_id = data.get('form_course_id', '')
        if form_course_id:
            course_mapping = {
                'automotive_engine_repairer': 'Automotive Engine Repairer',
                'automotive_clutch_brake_repairer': 'Automotive Clutch and Brake Repairer',
                'automotive_suspension_fitter': 'Automotive Suspension Fitter',
                'automotive_workshop_assistant': 'Automotive Workshop Assistant',
            }
            if form_course_id in course_mapping:
                course_title = course_mapping[form_course_id]
                course = Course.objects.filter(title__icontains=course_title).first()
                if not course:
                    course = Course.objects.filter(title=course_title).first()
                if course:
                    data['course'] = course
                    data['course_title'] = course.title
        
        # Set default status
        if not data.get('status'):
            data['status'] = 'pending'
        
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
            'completion_date', 'status', 'certificate_id', 'address',
            'age', 'id_number', 'country', 'education_level', 'previous_school', 'fees_status'
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
    video_file = serializers.SerializerMethodField()
    
    class Meta:
        model = DirectorMessage
        fields = ['id', 'quote', 'video_file', 'video_url', 'is_active', 
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
    
    def get_video_file(self, obj):
        if obj.video_file and hasattr(obj.video_file, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.video_file.url)
            return obj.video_file.url
        return None

# ========== ADMIN AUTH SERIALIZERS ==========
class AdminLoginSerializer(serializers.Serializer):
    """Validates admin credentials against Django's user store."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, trim_whitespace=False)

    def validate(self, attrs):
        from django.contrib.auth import get_user_model

        email = attrs['email'].strip().lower()
        password = attrs['password']

        User = get_user_model()

        # The admin account is configured with the email as the username, but we
        # also accept a user record whose email field matches, so the admin can
        # sign in with whichever identifier was configured for them.
        user = (
            User.objects.filter(username__iexact=email).first()
            or User.objects.filter(email__iexact=email).first()
        )

        if user is None or not user.check_password(password):
            raise serializers.ValidationError({'detail': 'Invalid email address or password.'})

        if not user.is_active:
            raise serializers.ValidationError({'detail': 'This admin account has been deactivated.'})

        if not (user.is_staff or user.is_superuser):
            raise serializers.ValidationError({'detail': 'This account does not have admin access.'})

        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Validates and applies an admin password change."""

    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=False)

    default_error_messages = {
        'password_mismatch': 'The new password and confirmation do not match.',
        'password_too_short': 'Password must be at least 8 characters long.',
        'password_too_common': 'This password is too common. Please choose a more unique password.',
        'password_too_similar': 'The new password is too similar to your current password.',
        'password_not_numeric': 'The password cannot be entirely numeric.',
        'current_password_invalid': 'Your current password is incorrect.',
        'same_as_current': 'The new password must be different from your current password.',
    }

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(self.error_messages['current_password_invalid'])
        return value

    @staticmethod
    def _is_too_similar(new_password, current_password):
        """
        Reject a new password that is (nearly) identical to the current one.

        Django's built-in validators only compare against user attributes
        (name, email, ...), so we add this explicit check ourselves.
        """
        if not current_password:
            return False

        new_normalised = new_password.lower()
        current_normalised = current_password.lower()

        if new_normalised == current_normalised:
            return True

        # Guard against a trivial edit of the current password, e.g. appending a
        # single character or swapping a couple of characters.
        if abs(len(new_normalised) - len(current_normalised)) <= 1:
            similarity = SequenceMatcher(None, new_normalised, current_normalised).ratio()
            if similarity >= 0.9:
                return True

        return False

    def validate(self, attrs):
        request = self.context['request']
        user = request.user

        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': [self.error_messages['password_mismatch']]})

        if attrs['new_password'] == attrs['current_password']:
            raise serializers.ValidationError({'new_password': [self.error_messages['same_as_current']]})

        if self._is_too_similar(attrs['new_password'], attrs['current_password']):
            raise serializers.ValidationError({'new_password': [self.error_messages['password_too_similar']]})

        if len(attrs['new_password']) < 8:
            raise serializers.ValidationError({'new_password': [self.error_messages['password_too_short']]})

        if attrs['new_password'].isdigit():
            raise serializers.ValidationError({'new_password': [self.error_messages['password_not_numeric']]})

        # Reuse Django's own password validators so the rules stay consistent
        # with the server-side AUTH_PASSWORD_VALIDATORS configuration.
        from django.contrib.auth.password_validation import validate_password

        try:
            validate_password(attrs['new_password'], user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'new_password': list(exc.messages)})

        attrs['user'] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user


class AdminUserSerializer(serializers.ModelSerializer):
    """Safe representation of the logged-in admin (never exposes the hash)."""

    class Meta:
        from django.contrib.auth.models import User
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'last_login']
        read_only_fields = fields


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
