from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
]

# Serve media files in ALL environments (development AND production)
if settings.DEBUG:
    # Development: Use Django's built-in static serving
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    
    # Serve files from custom directories in development
    urlpatterns += static('/pdfs/', document_root=os.path.join(settings.BASE_DIR, 'pdfs'))
    urlpatterns += static('/modules/', document_root=os.path.join(settings.BASE_DIR, 'modules'))
else:
    # Production: Explicitly serve media files with serve view
    # This ensures uploaded files are accessible even without DEBUG mode
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve, {
            'document_root': settings.MEDIA_ROOT,
        }),
        re_path(r'^static/(?P<path>.*)$', serve, {
            'document_root': settings.STATIC_ROOT,
        }),
        re_path(r'^pdfs/(?P<path>.*)$', serve, {
            'document_root': os.path.join(settings.BASE_DIR, 'pdfs'),
        }),
        re_path(r'^modules/(?P<path>.*)$', serve, {
            'document_root': os.path.join(settings.BASE_DIR, 'modules'),
        }),
    ]