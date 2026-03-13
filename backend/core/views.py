from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import FileResponse, Http404
from django.conf import settings
import os
import mimetypes

from .models import (
    Course, CourseRequirement, Application, Student, 
    Newsletter, GalleryImage, NewsPost,
    TeamMember, Testimonial, Video, DirectorMessage
)
from .serializers import (
    CourseSerializer, CourseRequirementSerializer,
    ApplicationSerializer, ApplicationDetailSerializer, ApplicationDocumentsSerializer,
    StudentSerializer,
    NewsletterSerializer, GalleryImageSerializer,
    NewsPostSerializer, TeamMemberSerializer,
    TestimonialSerializer, VideoSerializer, DirectorMessageSerializer
)

# ========== DOCUMENT SERVING VIEW ==========
@api_view(['GET'])
def serve_document(request, file_path):
    """Serve document files with proper content disposition"""
    # Construct the full file path
    full_path = os.path.join(settings.MEDIA_ROOT, file_path)
    
    # Check if file exists
    if not os.path.exists(full_path):
        raise Http404("File does not exist")
    
    # Open the file
    file_handle = open(full_path, 'rb')
    
    # Guess content type
    content_type, encoding = mimetypes.guess_type(full_path)
    if content_type is None:
        content_type = 'application/octet-stream'
    
    # Create response
    response = FileResponse(file_handle, content_type=content_type)
    response['Content-Disposition'] = f'inline; filename="{os.path.basename(full_path)}"'
    response['Content-Length'] = os.path.getsize(full_path)
    
    return response

# ========== DEBUG VIEW ==========
@api_view(['GET'])
def debug_courses(request):
    """Debug endpoint to check available courses"""
    courses = Course.objects.all()
    data = {
        'count': courses.count(),
        'courses': [
            {
                'id': c.id,
                'title': c.title,
                'short_title': c.short_title,
                'is_active': c.is_active
            } for c in courses
        ]
    }
    return Response(data)

# ========== APPLICATION VIEWS ==========
class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all().order_by('-applied_date')
    serializer_class = ApplicationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        """Return different serializers based on action"""
        if self.action == 'retrieve':
            return ApplicationDetailSerializer
        return ApplicationSerializer
    
    def get_serializer_context(self):
        """Pass request context to serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """Filter applications based on query parameters"""
        queryset = Application.objects.all().order_by('-applied_date')
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by fee_verified
        fee_verified = self.request.query_params.get('fee_verified', None)
        if fee_verified:
            if fee_verified.lower() == 'true':
                queryset = queryset.filter(fee_verified=True)
            elif fee_verified.lower() == 'false':
                queryset = queryset.filter(fee_verified=False)
        
        # Search by name, email, or mobile
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(surname__icontains=search) |
                Q(email__icontains=search) |
                Q(mobile__icontains=search)
            )
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create a new application with file uploads - FIXED"""
        try:
            print("=" * 60)
            print("📝 RECEIVING APPLICATION SUBMISSION")
            print("=" * 60)
            print("📁 Files received:", list(request.FILES.keys()))
            print("📋 Data received:", dict(request.data))
            print("=" * 60)
            
            # Prepare data
            data = request.data.copy()
            files = request.FILES
            
            # CRITICAL FIX: Handle course mapping properly
            # Check for course_id in the request data (sent from React)
            if 'course_id' in data:
                course_id_value = data['course_id']
                print(f"🎯 Found course_id: {course_id_value}")
                
                # Set form_course_id for the serializer
                data['form_course_id'] = course_id_value
                
                # Also try to directly map to a Course object
                course_mapping = {
                    'automotive_engine_repairer': 'Automotive Engine Repairer',
                    'automotive_clutch_brake_repairer': 'Automotive Clutch and Brake Repairer',
                    'automotive_suspension_fitter': 'Automotive Suspension Fitter',
                    'automotive_workshop_assistant': 'Automotive Workshop Assistant',
                }
                
                if course_id_value in course_mapping:
                    course_title = course_mapping[course_id_value]
                    try:
                        # Try contains first
                        course = Course.objects.filter(title__icontains=course_title).first()
                        
                        # If not found, try exact match
                        if not course:
                            course = Course.objects.filter(title=course_title).first()
                        
                        if course:
                            data['course'] = course.id
                            print(f"✅ SUCCESS: Mapped course: {course.title} (ID: {course.id})")
                        else:
                            print(f"⚠️ WARNING: Course not found for title: {course_title}")
                            
                            # List all available courses for debugging
                            all_courses = Course.objects.all()
                            print(f"📚 Available courses: {[c.title for c in all_courses]}")
                    except Exception as e:
                        print(f"❌ Error finding course: {e}")
            
            # Also check for 'course' field
            elif 'course' in data and isinstance(data['course'], str):
                data['form_course_id'] = data['course']
                print(f"🎯 Found course field: {data['course']}")
            
            # Create serializer with request context
            serializer = self.get_serializer(data=data, context={'request': request})
            
            if serializer.is_valid():
                # Save application
                application = serializer.save()
                
                # Handle file uploads
                file_fields = ['id_document', 'matric_certificate', 'proof_of_payment', 
                             'additional_doc_1', 'additional_doc_2']
                
                for field in file_fields:
                    if field in files:
                        file_obj = files[field]
                        setattr(application, field, file_obj)
                        print(f"📎 Attached {field}: {file_obj.name}")
                
                application.save()
                
                # Return response
                response_serializer = ApplicationDetailSerializer(
                    application, 
                    context={'request': request}
                )
                
                print("=" * 60)
                print(f"✅ SUCCESS: Application {application.id} created!")
                print(f"   👤 Name: {application.name} {application.surname}")
                print(f"   📚 Course: {application.course.title if application.course else 'No course'}")
                print(f"   📋 Course Title: {application.course_title}")
                print(f"   📁 Documents: {application.get_documents_status_display() if hasattr(application, 'get_documents_status_display') else 'None'}")
                print("=" * 60)
                
                return Response({
                    'id': application.id,
                    'message': 'Application submitted successfully!',
                    'status': 'pending',
                    'data': response_serializer.data
                }, status=status.HTTP_201_CREATED)
            else:
                print("❌ Serializer errors:", serializer.errors)
                return Response({
                    'error': 'Validation failed',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"❌ Error creating application: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Failed to create application',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get all documents for an application with full URLs"""
        application = self.get_object()
        serializer = ApplicationDocumentsSerializer(
            application, 
            context={'request': request}
        )
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """Approve an application"""
        application = self.get_object()
        application.status = 'approved'
        application.save()
        
        # Create student record if approved
        if not hasattr(application, 'student_record'):
            Student.objects.create(
                application=application,
                name=application.name,
                surname=application.surname,
                email=application.email,
                phone=application.mobile,
                course=application.course,
                address=application.address
            )
        
        return Response({
            'message': 'Application approved successfully',
            'status': 'approved'
        })
    
    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        """Reject an application"""
        application = self.get_object()
        application.status = 'rejected'
        application.rejection_reason = request.data.get('reason', '')
        application.save()
        
        return Response({
            'message': 'Application rejected successfully',
            'status': 'rejected',
            'reason': application.rejection_reason
        })
    
    @action(detail=True, methods=['patch'])
    def verify_fee(self, request, pk=None):
        """Verify payment fee"""
        application = self.get_object()
        application.fee_verified = True
        application.save()
        
        return Response({
            'message': 'Fee verified successfully',
            'fee_verified': True
        })
    
    @action(detail=True, methods=['patch'])
    def unverify_fee(self, request, pk=None):
        """Unverify payment fee"""
        application = self.get_object()
        application.fee_verified = False
        application.save()
        
        return Response({
            'message': 'Fee verification removed',
            'fee_verified': False
        })
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending applications"""
        queryset = Application.objects.filter(status='pending').order_by('-applied_date')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get application statistics"""
        total = Application.objects.count()
        pending = Application.objects.filter(status='pending').count()
        approved = Application.objects.filter(status='approved').count()
        rejected = Application.objects.filter(status='rejected').count()
        fee_verified = Application.objects.filter(fee_verified=True).count()
        
        return Response({
            'total': total,
            'pending': pending,
            'approved': approved,
            'rejected': rejected,
            'fee_verified': fee_verified,
        })

# ========== COURSE VIEWS ==========
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('display_order', '-created_at')
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'
    
    def get_queryset(self):
        # Allow admin to see all courses (including inactive)
        is_admin = self.request.query_params.get('admin', 'false').lower() == 'true'
        if is_admin:
            return Course.objects.all().order_by('display_order', '-created_at')
        return Course.objects.filter(is_active=True).order_by('display_order', '-created_at')
    
    def get_serializer_context(self):
        """Pass request context to serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class CourseRequirementViewSet(viewsets.ModelViewSet):
    queryset = CourseRequirement.objects.all()
    serializer_class = CourseRequirementSerializer
    permission_classes = [AllowAny]

# ========== OTHER VIEWS ==========
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]

class NewsletterViewSet(viewsets.ModelViewSet):
    queryset = Newsletter.objects.filter(is_active=True)
    serializer_class = NewsletterSerializer
    permission_classes = [AllowAny]

class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.filter(is_active=True)
    serializer_class = GalleryImageSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
        """Pass request context to serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class NewsPostViewSet(viewsets.ModelViewSet):
    queryset = NewsPost.objects.all().order_by('-created_at')
    serializer_class = NewsPostSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        is_admin = self.request.query_params.get('admin', 'false').lower() == 'true'
        if is_admin:
            return NewsPost.objects.all().order_by('-created_at')
        return NewsPost.objects.filter(is_published=True).order_by('-created_at')
    
    def get_serializer_context(self):
        """Pass request context to serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.filter(is_active=True).order_by('order')
    serializer_class = TeamMemberSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
        """Pass request context to serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = VideoSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
        """Pass request context to serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class DirectorMessageViewSet(viewsets.ModelViewSet):
    queryset = DirectorMessage.objects.all().order_by('-created_at')
    serializer_class = DirectorMessageSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
        """Pass request context to serializer"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        message = DirectorMessage.objects.filter(is_active=True).first()
        if message:
            serializer = self.get_serializer(message, context={'request': request})
            return Response(serializer.data)
        return Response({})
    
    def create(self, request, *args, **kwargs):
        DirectorMessage.objects.filter(is_active=True).update(is_active=False)
        
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Simple view to get PDF URL
@api_view(['GET'])
def get_course_pdf(request, course_id):
    """Get direct URL to course PDF"""
    course = get_object_or_404(Course, id=course_id)
    
    if not course.course_pdf_url:
        return Response({"error": "No PDF available for this course"}, status=404)
    
    pdf_filename = course.course_pdf_url.split('/')[-1]
    pdf_url = f"http://localhost:8000/pdfs/course-outlines/{pdf_filename}"
    
    return Response({"pdf_url": pdf_url})

# ========== DASHBOARD STATS ==========
@api_view(['GET'])
def dashboard_stats(request):
    """Get dashboard statistics"""
    total_applications = Application.objects.count()
    pending_applications = Application.objects.filter(status='pending').count()
    approved_applications = Application.objects.filter(status='approved').count()
    total_students = Student.objects.count()
    active_courses = Course.objects.filter(is_active=True).count()
    
    return Response({
        'total_applications': total_applications,
        'pending_applications': pending_applications,
        'approved_applications': approved_applications,
        'total_students': total_students,
        'active_courses': active_courses,
    })