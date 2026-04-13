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
import json
import logging
from decimal import Decimal
from urllib.parse import urljoin

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
from .services.payfast import PayFastService, get_payfast_service

logger = logging.getLogger(__name__)


def _get_application_registration_fee(application: Application) -> Decimal:
    return Decimal(str(settings.REGISTRATION_FEE_AMOUNT))


def _build_payfast_notify_url(request) -> str:
    configured_base = getattr(settings, 'PAYFAST_NOTIFY_BASE_URL', '').strip()
    if configured_base:
        return urljoin(f'{configured_base}/', 'api/payfast/notify/')
    return request.build_absolute_uri('/api/payfast/notify/')

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
    from django.db.models import Sum, F, DecimalField
    
    total_applications = Application.objects.count()
    pending_applications = Application.objects.filter(status='pending').count()
    total_students = Student.objects.count()
    active_students = Student.objects.filter(status='Active').count()
    active_courses = Course.objects.filter(is_active=True).count()
    
    # Calculate revenue from students with paid fees
    # Revenue = (assessment_fee + registration_fee) per student
    students_with_paid_fees = Student.objects.filter(fees_status='Paid').select_related('course')
    
    total_revenue = 0
    for student in students_with_paid_fees:
        if student.course:
            total_revenue += float(student.course.assessment_fee or 0) + float(student.course.registration_fee or 0)
    
    return Response({
        'total_applications': total_applications,
        'pending_applications': pending_applications,
        'total_students': total_students,
        'active_students': active_students,
        'active_courses': active_courses,
        'total_revenue': total_revenue,
    })


# ========== PAYFAST PAYMENT VIEWS ==========
@api_view(['POST'])
def initiate_payfast_payment(request):
    """
    Initiate a PayFast payment for an application
    
    Expected POST data:
    {
        "application_id": 123,
        "return_url": "https://yourdomain.com/payment-success",
        "cancel_url": "https://yourdomain.com/payment-cancel"
    }
    """
    try:
        application_id = request.data.get('application_id')
        return_url = request.data.get('return_url', '')
        cancel_url = request.data.get('cancel_url', '')
        
        # Validate required fields
        if not application_id or not return_url or not cancel_url:
            return Response(
                {"error": "Missing required fields: application_id, return_url, cancel_url"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get application
        try:
            application = Application.objects.select_related('course').get(id=application_id)
        except Application.DoesNotExist:
            return Response(
                {"error": f"Application with ID {application_id} not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Initialize PayFast service
        payfast = get_payfast_service()
        if not all([payfast.merchant_id, payfast.merchant_key, payfast.security_passphrase]):
            logger.error("PayFast credentials are missing in the server environment")
            return Response(
                {"error": "Payment gateway is not configured yet. Please contact support."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        amount = _get_application_registration_fee(application)

        # Build notify URL (webhook URL)
        notify_url = _build_payfast_notify_url(request)
        
        # Create payment form data
        payment_data = payfast.create_payment_form_data(
            application_id=application_id,
            amount=amount,
            return_url=return_url,
            cancel_url=cancel_url,
            notify_url=notify_url,
            email_address=application.email,
            payer_name=f"{application.name} {application.surname}"
        )
        
        logger.info("Payment initiation for application %s, amount: %s", application_id, amount)

        return Response({
            "success": True,
            "payfast_url": payfast.get_payfast_url(),
            "form_data": payment_data,
            "notify_url": notify_url,
            "amount": f"{amount:.2f}",
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error initiating PayFast payment: {str(e)}")
        return Response(
            {"error": f"Error initiating payment: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST', 'GET'])
def payfast_notify(request):
    """
    PayFast webhook/notification endpoint
    Called by PayFast when payment is processed
    
    This URL should be set in your PayFast merchant settings as the "Notify URL"
    Notify URL should be: https://yourdomain.com/api/payfast/notify/
    """
    try:
        # Get POST data from PayFast
        if request.method != 'POST':
            return Response(
                {"error": "Method not allowed"},
                status=status.HTTP_405_METHOD_NOT_ALLOWED
            )

        post_data = request.POST.dict()

        logger.info("PayFast notification received: %s", post_data.get('m_payment_id'))
        
        # Initialize PayFast service
        payfast = get_payfast_service()
        
        # Validate the notification
        if not payfast.validate_payment(post_data):
            logger.warning("Invalid PayFast signature for payment %s", post_data.get('m_payment_id'))
            return Response(
                {"error": "Invalid signature"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Extract payment information
        m_payment_id = post_data.get('m_payment_id')
        payment_status = post_data.get('payment_status', 'failed')
        pf_payment_id = post_data.get('pf_payment_id')
        amount_gross = post_data.get('amount_gross')
        
        # Get the application
        try:
            application = Application.objects.select_related('course').get(id=m_payment_id)
        except Application.DoesNotExist:
            logger.error("Application with ID %s not found for payment %s", m_payment_id, pf_payment_id)
            return Response(
                {"error": f"Application not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        expected_amount = _get_application_registration_fee(application)
        try:
            received_amount = Decimal(str(amount_gross))
        except Exception:
            logger.error("Invalid amount received for application %s: %s", m_payment_id, amount_gross)
            return Response(
                {"error": "Invalid payment amount"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if received_amount.quantize(Decimal('0.01')) != expected_amount.quantize(Decimal('0.01')):
            logger.error(
                "Amount mismatch for application %s: expected %s, received %s",
                m_payment_id,
                expected_amount,
                received_amount,
            )
            return Response(
                {"error": "Payment amount mismatch"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process payment based on status
        if payment_status == 'COMPLETE':
            # Payment is complete and verified
            application.fee_verified = True
            application.payment_reference = application.payment_reference or m_payment_id
            application.save()

            logger.info("Payment verified for application %s, PayFast ID: %s", m_payment_id, pf_payment_id)
            
            # You can add email notification here
            # send_payment_confirmation_email(application)
            
            return Response({
                "status": "success",
                "message": "Payment processed successfully"
            }, status=status.HTTP_200_OK)
            
        elif payment_status == 'FAILED':
            # Payment failed
            logger.warning("Payment failed for application %s", m_payment_id)
            
            return Response({
                "status": "failed",
                "message": "Payment processing failed"
            }, status=status.HTTP_200_OK)
            
        else:
            # Payment is pending or in other state
            logger.info("Payment status for application %s: %s", m_payment_id, payment_status)
            
            return Response({
                "status": "pending",
                "message": f"Payment status: {payment_status}"
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Error processing PayFast notification: {str(e)}")
        return Response(
            {"error": f"Error processing notification: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_payment_status(request, application_id):
    """Get payment status for an application"""
    try:
        application = Application.objects.get(id=application_id)
        
        return Response({
            "application_id": application.id,
            "fee_verified": application.fee_verified,
            "payment_reference": application.payment_reference,
            "status": "paid" if application.fee_verified else "pending"
        }, status=status.HTTP_200_OK)
        
    except Application.DoesNotExist:
        return Response(
            {"error": f"Application with ID {application_id} not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error getting payment status: {str(e)}")
        return Response(
            {"error": f"Error getting payment status: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
