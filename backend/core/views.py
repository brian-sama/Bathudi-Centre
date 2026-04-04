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
    full_path = os.path.join(settings.MEDIA_ROOT, file_path)
    if not os.path.exists(full_path):
        raise Http404("File does not exist")
    file_handle = open(full_path, 'rb')
    content_type, encoding = mimetypes.guess_type(full_path)
    if content_type is None:
        content_type = 'application/octet-stream'
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
        if self.action == 'retrieve':
            return ApplicationDetailSerializer
        return ApplicationSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        queryset = Application.objects.all().order_by('-applied_date')
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        fee_verified = self.request.query_params.get('fee_verified', None)
        if fee_verified:
            if fee_verified.lower() == 'true':
                queryset = queryset.filter(fee_verified=True)
            elif fee_verified.lower() == 'false':
                queryset = queryset.filter(fee_verified=False)
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
        """Create a new application with file uploads"""
        data = request.data.copy()
        files = request.FILES
        
        # Handle course mapping if course_id is provided
        if 'course_id' in data:
            data['form_course_id'] = data['course_id']
        
        serializer = self.get_serializer(data=data, context={'request': request})
        if serializer.is_valid():
            application = serializer.save()
            # Handle file uploads explicitly if needed, but ModelSerializer usually handles it
            application.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """Approve an application and create student record"""
        application = self.get_object()
        application.status = 'approved'
        application.save()
        
        if not hasattr(application, 'student_record'):
            Student.objects.create(
                application=application,
                name=application.name,
                surname=application.surname,
                email=application.email,
                phone=application.mobile,
                course=application.course,
                address=application.address,
                age=application.age,
                id_number=application.id_number,
                country=application.country,
                education_level=application.education_level,
                previous_school=application.previous_school,
                status='Active',
                fees_status='Pending'
            )
        return Response({'message': 'Application approved', 'status': 'approved'})
    
    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        application = self.get_object()
        application.status = 'rejected'
        application.rejection_reason = request.data.get('reason', '')
        application.save()
        return Response({'message': 'Application rejected', 'status': 'rejected'})

    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get document details for an application"""
        application = self.get_object()
        serializer = ApplicationDocumentsSerializer(application, context={'request': request})
        return Response(serializer.data)

# ========== COURSE VIEWS ==========
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('display_order', '-created_at')
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

class CourseRequirementViewSet(viewsets.ModelViewSet):
    queryset = CourseRequirement.objects.all()
    serializer_class = CourseRequirementSerializer
    permission_classes = [AllowAny]

# ========== STUDENT VIEWS ==========
class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all().order_by('-enrollment_date')
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def bulk_enroll(self, request):
        students_data = request.data
        if not isinstance(students_data, list):
            return Response({'error': 'Expected a list of students'}, status=status.HTTP_400_BAD_REQUEST)

        created_students = []
        errors = []
        
        try:
            courses_map = {}
            for c in Course.objects.filter(is_active=True):
                if c.title: courses_map[c.title.lower()] = c
                if getattr(c, 'short_title', None): courses_map[c.short_title.lower()] = c

            for index, student_data in enumerate(students_data):
                try:
                    if isinstance(student_data, dict):
                        normalized_data = {str(k).lower().strip(): v for k, v in student_data.items()}
                    else:
                        normalized_data = {}

                    course_name = str(normalized_data.get('course', '')).lower().strip()
                    course = courses_map.get(course_name)
                    if not course:
                        for title, course_obj in courses_map.items():
                            if course_name in title:
                                course = course_obj
                                break
                    
                    name = normalized_data.get('name') or normalized_data.get('names') or normalized_data.get('first_name')
                    surname = normalized_data.get('surname') or normalized_data.get('surnames') or normalized_data.get('last_name')
                    email = normalized_data.get('email')
                    phone = normalized_data.get('phone') or normalized_data.get('number') or normalized_data.get('mobile')

                    if not all([name, surname, email, phone]):
                        errors.append({'row': index + 2, 'errors': 'Missing required fields'})
                        continue

                    data = {
                        'name': str(name).strip(),
                        'surname': str(surname).strip(),
                        'email': str(email).strip(),
                        'phone': str(phone).strip(),
                        'course': course.id if course else None,
                        'status': 'Active',
                        'age': normalized_data.get('age'),
                        'id_number': normalized_data.get('id_number') or normalized_data.get('id') or normalized_data.get('passport'),
                        'country': normalized_data.get('country', 'South Africa'),
                        'education_level': normalized_data.get('education_level') or normalized_data.get('education'),
                        'previous_school': normalized_data.get('previous_school') or normalized_data.get('school'),
                        'fees_status': normalized_data.get('fees_status') or normalized_data.get('payment_status') or 'Pending',
                        'address': normalized_data.get('address', '')
                    }

                    serializer = self.get_serializer(data=data)
                    if serializer.is_valid():
                        student = serializer.save()
                        created_students.append(self.get_serializer(student).data)
                    else:
                        errors.append({'row': index + 2, 'errors': serializer.errors})
                except Exception as e:
                    errors.append({'row': index + 2, 'errors': str(e)})

            return Response({
                'message': f'Processed {len(students_data)} rows. {len(created_students)} successful.',
                'created_count': len(created_students),
                'error_count': len(errors),
                'errors': errors
            }, status=status.HTTP_201_CREATED if not errors else status.HTTP_207_MULTI_STATUS)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ========== OTHER VIEWSETS ==========
class NewsletterViewSet(viewsets.ModelViewSet):
    queryset = Newsletter.objects.filter(is_active=True)
    serializer_class = NewsletterSerializer
    permission_classes = [AllowAny]

class GalleryImageViewSet(viewsets.ModelViewSet):
    queryset = GalleryImage.objects.filter(is_active=True)
    serializer_class = GalleryImageSerializer
    permission_classes = [AllowAny]

class NewsPostViewSet(viewsets.ModelViewSet):
    queryset = NewsPost.objects.all().order_by('-created_at')
    serializer_class = NewsPostSerializer
    permission_classes = [AllowAny]

class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.filter(is_active=True).order_by('order')
    serializer_class = TeamMemberSerializer
    permission_classes = [AllowAny]

class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]

class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.filter(is_active=True).order_by('-created_at')
    serializer_class = VideoSerializer
    permission_classes = [AllowAny]

class DirectorMessageViewSet(viewsets.ModelViewSet):
    queryset = DirectorMessage.objects.all().order_by('-created_at')
    serializer_class = DirectorMessageSerializer
    permission_classes = [AllowAny]
    
    def get_serializer_context(self):
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

@api_view(['GET'])
def get_course_pdf(request, course_id):
    """Get direct URL to course PDF"""
    course = get_object_or_404(Course, id=course_id)
    if not course.course_pdf_url:
        return Response({"error": "No PDF available"}, status=404)
    pdf_filename = course.course_pdf_url.split('/')[-1]
    pdf_url = request.build_absolute_uri(f"/pdfs/course-outlines/{pdf_filename}")
    return Response({"pdf_url": pdf_url})

@api_view(['GET'])
def dashboard_stats(request):
    total_applications = Application.objects.count()
    pending_applications = Application.objects.filter(status='pending').count()
    total_students = Student.objects.count()
    active_students = Student.objects.filter(status='Active').count()
    active_courses = Course.objects.filter(is_active=True).count()
    
    return Response({
        'total_applications': total_applications,
        'pending_applications': pending_applications,
        'total_students': total_students,
        'active_students': active_students,
        'active_courses': active_courses,
    })
