from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from .views import (
    CourseViewSet, ApplicationViewSet, StudentViewSet,
    NewsletterViewSet, GalleryImageViewSet, NewsPostViewSet,
    TeamMemberViewSet, TestimonialViewSet,
    VideoViewSet, DirectorMessageViewSet,
    get_course_pdf, dashboard_stats, serve_document, debug_courses,
    initiate_payfast_payment, payfast_notify, get_payment_status
)

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'applications', ApplicationViewSet, basename='application')
router.register(r'students', StudentViewSet)
router.register(r'newsletters', NewsletterViewSet)
router.register(r'gallery', GalleryImageViewSet)
router.register(r'news-posts', NewsPostViewSet)
router.register(r'team', TeamMemberViewSet)
router.register(r'testimonials', TestimonialViewSet)
router.register(r'videos', VideoViewSet)
router.register(r'director-message', DirectorMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Debug endpoint
    path('debug/courses/', debug_courses, name='debug-courses'),
    
    # PayFast Payment Gateway endpoints
    path('payfast/initiate/', initiate_payfast_payment, name='payfast-initiate'),
    path('payfast/notify/', payfast_notify, name='payfast-notify'),
    path('payfast/status/<int:application_id>/', get_payment_status, name='payfast-status'),
    
    # Document serving endpoint - IMPORTANT: This must come before media serving
    re_path(r'^media/(?P<file_path>.+)$', serve_document, name='serve-document'),
    
    # Simple PDF URL getter
    path('course/<int:course_id>/pdf/', get_course_pdf, name='get_course_pdf'),
    
    # Dashboard stats
    path('dashboard/stats/', dashboard_stats, name='dashboard_stats'),
]