from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import (
    Course, CourseRequirement, Application, Student, 
    TeamMember, GalleryImage, Newsletter, NewsPost,
    DirectorMessage, Testimonial, Video
)

# ========== CUSTOM FILTERS ==========
class FeeVerifiedFilter(admin.SimpleListFilter):
    title = 'Fee Verified'
    parameter_name = 'fee_verified'
    
    def lookups(self, request, model_admin):
        return (
            ('yes', 'Verified'),
            ('no', 'Not Verified'),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'yes':
            return queryset.filter(fee_verified=True)
        if self.value() == 'no':
            return queryset.filter(fee_verified=False)

class DocumentsFilter(admin.SimpleListFilter):
    title = 'Documents Status'
    parameter_name = 'documents'
    
    def lookups(self, request, model_admin):
        return (
            ('complete', 'Complete (ID+Matric+POP)'),
            ('partial', 'Partial'),
            ('none', 'No Documents'),
        )
    
    def queryset(self, request, queryset):
        if self.value() == 'complete':
            return queryset.exclude(id_document='').exclude(matric_certificate='').exclude(proof_of_payment='')
        elif self.value() == 'partial':
            return queryset.filter(
                models.Q(id_document='') & models.Q(matric_certificate='') & models.Q(proof_of_payment='')
            ).exclude(
                models.Q(id_document='') | models.Q(matric_certificate='') | models.Q(proof_of_payment='')
            )
        elif self.value() == 'none':
            return queryset.filter(id_document='', matric_certificate='', proof_of_payment='')
        return queryset

# ========== COURSE ADMIN ==========
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'short_title', 'duration', 'display_fees', 'has_pdf', 'application_count', 'is_active', 'is_featured']
    list_filter = ['is_active', 'is_featured', 'level']
    search_fields = ['title', 'short_title', 'description', 'short_description']
    list_editable = ['is_active', 'is_featured']
    
    actions = ['activate_courses', 'deactivate_courses']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'short_title', 'description', 'short_description', 'duration', 'level')
        }),
        ('Fee Information', {
            'fields': ('credits', 'deposit_amount', 'monthly_payment', 'total_payment', 
                      'assessment_fee', 'fee', 'registration_fee')
        }),
        ('Course Details', {
            'fields': ('curriculum', 'prerequisites', 'requirements', 'career_opportunities')
        }),
        ('Documents', {
            'fields': ('course_pdf', 'course_pdf_url')
        }),
        ('Display Settings', {
            'fields': ('is_featured', 'is_active', 'is_math_required', 'display_order')
        }),
        ('Images', {
            'fields': ('image', 'image_url')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def display_fees(self, obj):
        return f"R{obj.total_payment} total"
    display_fees.short_description = 'Total Fee'
    
    def has_pdf(self, obj):
        if obj.course_pdf or obj.course_pdf_url:
            return format_html('<span style="color: green;">✓ PDF</span>')
        return format_html('<span style="color: red;">✗ No PDF</span>')
    has_pdf.short_description = 'PDF'
    
    def application_count(self, obj):
        count = obj.applications.count()
        url = reverse('admin:core_application_changelist') + f'?course__id__exact={obj.id}'
        return format_html('<a href="{}">{} Applications</a>', url, count)
    application_count.short_description = 'Applications'
    
    def activate_courses(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} courses activated.')
    activate_courses.short_description = "Activate selected courses"
    
    def deactivate_courses(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} courses deactivated.')
    deactivate_courses.short_description = "Deactivate selected courses"

# ========== APPLICATION ADMIN ==========
@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'mobile', 'course', 'status_badge', 'fee_verified_badge', 
                   'documents_icons', 'applied_date_formatted', 'quick_actions']
    list_filter = ['status', FeeVerifiedFilter, DocumentsFilter, 'course', 'country', 'applied_date']
    search_fields = ['name', 'surname', 'email', 'mobile', 'id_number', 'course__title']
    list_per_page = 50
    readonly_fields = ['applied_date', 'documents_preview', 'view_documents_link']
    ordering = ['-applied_date']
    
    actions = ['mark_pending', 'mark_approved', 'mark_rejected', 'verify_fee', 'unverify_fee']
    
    fieldsets = (
        ('Application Information', {
            'fields': ('applied_date', 'status', 'fee_verified', 'notes')
        }),
        ('Personal Information', {
            'fields': ('name', 'surname', 'age', 'country', 'mobile', 'email', 
                      'id_number', 'address')
        }),
        ('Education Information', {
            'fields': ('education_level', 'previous_school')
        }),
        ('Course Selection', {
            'fields': ('course', 'course_title', 'form_course_id', 'qualification', 'experience', 'message')
        }),
        ('Document Uploads', {
            'fields': ('id_document', 'matric_certificate', 'proof_of_payment',
                      'additional_doc_1', 'additional_doc_2', 'documents_preview')
        }),
        ('Quick Actions', {
            'fields': ('view_documents_link',)
        }),
    )
    
    def full_name(self, obj):
        return f"{obj.name} {obj.surname}"
    full_name.short_description = 'Name'
    
    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'approved': 'green',
            'rejected': 'red',
            'contacted': 'blue',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 10px; font-size: 12px;">{}</span>',
            color, obj.get_status_display().upper()
        )
    status_badge.short_description = 'Status'
    
    def fee_verified_badge(self, obj):
        if obj.fee_verified:
            return format_html(
                '<span style="background-color: #10B981; color: white; padding: 3px 8px; border-radius: 10px; font-size: 12px;">✓ VERIFIED</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #EF4444; color: white; padding: 3px 8px; border-radius: 10px; font-size: 12px;">✗ NOT VERIFIED</span>'
            )
    fee_verified_badge.short_description = 'Fee'
    
    def documents_icons(self, obj):
        icons = []
        if obj.id_document:
            icons.append('<span title="ID Document" style="font-size: 18px; margin-right: 5px;">🆔</span>')
        if obj.matric_certificate:
            icons.append('<span title="Matric Certificate" style="font-size: 18px; margin-right: 5px;">🎓</span>')
        if obj.proof_of_payment:
            icons.append('<span title="Proof of Payment" style="font-size: 18px; margin-right: 5px;">💰</span>')
        if obj.additional_doc_1:
            icons.append('<span title="Additional Document 1" style="font-size: 18px; margin-right: 5px;">📄1</span>')
        if obj.additional_doc_2:
            icons.append('<span title="Additional Document 2" style="font-size: 18px; margin-right: 5px;">📄2</span>')
        
        if icons:
            return format_html(''.join(icons))
        return format_html('<span style="color: gray;">No Docs</span>')
    documents_icons.short_description = 'Documents'
    
    def applied_date_formatted(self, obj):
        return obj.applied_date.strftime('%d %b %Y %H:%M')
    applied_date_formatted.short_description = 'Applied'
    
    def documents_preview(self, obj):
        """Preview documents with direct links"""
        docs = []
        
        if obj.id_document and hasattr(obj.id_document, 'url'):
            docs.append(f'<strong>🆔 ID Document:</strong> <a href="{obj.id_document.url}" target="_blank">{obj.id_document.name.split("/")[-1]}</a>')
        
        if obj.matric_certificate and hasattr(obj.matric_certificate, 'url'):
            docs.append(f'<strong>🎓 Matric Certificate:</strong> <a href="{obj.matric_certificate.url}" target="_blank">{obj.matric_certificate.name.split("/")[-1]}</a>')
        
        if obj.proof_of_payment and hasattr(obj.proof_of_payment, 'url'):
            docs.append(f'<strong>💰 Proof of Payment:</strong> <a href="{obj.proof_of_payment.url}" target="_blank">{obj.proof_of_payment.name.split("/")[-1]}</a>')
        
        if obj.additional_doc_1 and hasattr(obj.additional_doc_1, 'url'):
            docs.append(f'<strong>📄 Additional Doc 1:</strong> <a href="{obj.additional_doc_1.url}" target="_blank">{obj.additional_doc_1.name.split("/")[-1]}</a>')
        
        if obj.additional_doc_2 and hasattr(obj.additional_doc_2, 'url'):
            docs.append(f'<strong>📄 Additional Doc 2:</strong> <a href="{obj.additional_doc_2.url}" target="_blank">{obj.additional_doc_2.name.split("/")[-1]}</a>')
        
        if docs:
            return format_html('<br>'.join(docs))
        return format_html('<span style="color: red;">No documents uploaded</span>')
    documents_preview.short_description = 'Uploaded Documents'
    
    def view_documents_link(self, obj):
        """Direct link to view all documents"""
        if any([obj.id_document, obj.matric_certificate, obj.proof_of_payment, 
                obj.additional_doc_1, obj.additional_doc_2]):
            return format_html('<a href="/admin/core/application/{}/documents/" style="padding: 8px 16px; background-color: #3B82F6; color: white; border-radius: 4px; text-decoration: none;">📁 View All Documents</a>', obj.id)
        return format_html('<span style="color: gray;">No documents to view</span>')
    view_documents_link.short_description = 'Document Preview'
    
    def quick_actions(self, obj):
        links = []
        if obj.status != 'approved':
            links.append(f'<a href="{reverse("admin:core_application_approve", args=[obj.id])}" style="color: green; margin-right: 10px;">✓ Approve</a>')
        if obj.status != 'rejected':
            links.append(f'<a href="{reverse("admin:core_application_reject", args=[obj.id])}" style="color: red; margin-right: 10px;">✗ Reject</a>')
        if not obj.fee_verified:
            links.append(f'<a href="{reverse("admin:core_application_verify_fee", args=[obj.id])}" style="color: blue;">💰 Verify Fee</a>')
        return format_html(' '.join(links))
    quick_actions.short_description = 'Quick Actions'
    
    # Admin Actions
    def mark_pending(self, request, queryset):
        updated = queryset.update(status='pending')
        self.message_user(request, f'{updated} applications marked as pending.')
    mark_pending.short_description = "Mark as Pending"
    
    def mark_approved(self, request, queryset):
        updated = queryset.update(status='approved')
        
        # Create student records for approved applications
        for app in queryset.filter(status='approved'):
            if not hasattr(app, 'student_record'):
                Student.objects.create(
                    application=app,
                    name=app.name,
                    surname=app.surname,
                    email=app.email,
                    phone=app.mobile,
                    course=app.course,
                    address=app.address
                )
        
        self.message_user(request, f'{updated} applications approved and student records created.')
    mark_approved.short_description = "Approve Applications"
    
    def mark_rejected(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f'{updated} applications rejected.')
    mark_rejected.short_description = "Reject Applications"
    
    def verify_fee(self, request, queryset):
        updated = queryset.update(fee_verified=True)
        self.message_user(request, f'{updated} application fees verified.')
    verify_fee.short_description = "Verify Fee Payment"
    
    def unverify_fee(self, request, queryset):
        updated = queryset.update(fee_verified=False)
        self.message_user(request, f'{updated} application fees unverified.')
    unverify_fee.short_description = "Unverify Fee Payment"
    
    # Custom views for documents
    def get_urls(self):
        from django.urls import path
        
        urls = super().get_urls()
        custom_urls = [
            path('<int:application_id>/documents/', self.admin_site.admin_view(self.view_documents), name='core_application_documents'),
            path('<int:application_id>/approve/', self.admin_site.admin_view(self.approve_application), name='core_application_approve'),
            path('<int:application_id>/reject/', self.admin_site.admin_view(self.reject_application), name='core_application_reject'),
            path('<int:application_id>/verify_fee/', self.admin_site.admin_view(self.verify_application_fee), name='core_application_verify_fee'),
        ]
        return custom_urls + urls
    
    def view_documents(self, request, application_id):
        from django.shortcuts import render, get_object_or_404
        
        app = get_object_or_404(Application, id=application_id)
        context = {
            'app': app,
            'has_id': bool(app.id_document),
            'has_matric': bool(app.matric_certificate),
            'has_pop': bool(app.proof_of_payment),
            'has_additional1': bool(app.additional_doc_1),
            'has_additional2': bool(app.additional_doc_2),
        }
        return render(request, 'admin/core/application/documents.html', context)
    
    def approve_application(self, request, application_id):
        from django.shortcuts import redirect, get_object_or_404
        from django.contrib import messages
        
        app = get_object_or_404(Application, id=application_id)
        app.status = 'approved'
        app.save()
        
        # Create student record
        if not hasattr(app, 'student_record'):
            Student.objects.create(
                application=app,
                name=app.name,
                surname=app.surname,
                email=app.email,
                phone=app.mobile,
                course=app.course,
                address=app.address
            )
        
        messages.success(request, f'Application for {app.name} {app.surname} approved successfully.')
        return redirect('admin:core_application_changelist')
    
    def reject_application(self, request, application_id):
        from django.shortcuts import redirect, get_object_or_404
        from django.contrib import messages
        
        app = get_object_or_404(Application, id=application_id)
        app.status = 'rejected'
        app.save()
        
        messages.success(request, f'Application for {app.name} {app.surname} rejected.')
        return redirect('admin:core_application_changelist')
    
    def verify_application_fee(self, request, application_id):
        from django.shortcuts import redirect, get_object_or_404
        from django.contrib import messages
        
        app = get_object_or_404(Application, id=application_id)
        app.fee_verified = True
        app.save()
        
        messages.success(request, f'Fee for {app.name} {app.surname} verified.')
        return redirect('admin:core_application_changelist')

# ========== STUDENT ADMIN ==========
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'student_id', 'course', 'status_badge', 'enrollment_date_formatted', 'view_application']
    list_filter = ['status', 'enrollment_date', 'course']
    search_fields = ['name', 'surname', 'email', 'student_id', 'phone']
    readonly_fields = ['enrollment_date', 'student_id']
    
    def full_name(self, obj):
        return f"{obj.name} {obj.surname}"
    full_name.short_description = 'Name'
    
    def status_badge(self, obj):
        colors = {
            'enrolled': 'blue',
            'completed': 'green',
            'dropped': 'red',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 10px; font-size: 12px;">{}</span>',
            color, obj.get_status_display().upper()
        )
    status_badge.short_description = 'Status'
    
    def enrollment_date_formatted(self, obj):
        return obj.enrollment_date.strftime('%d %b %Y')
    enrollment_date_formatted.short_description = 'Enrolled'
    
    def view_application(self, obj):
        if obj.application:
            url = reverse('admin:core_application_change', args=[obj.application.id])
            return format_html('<a href="{}">📋 View Application</a>', url)
        return '-'
    view_application.short_description = 'Application'

# ========== COURSE REQUIREMENT ADMIN ==========
@admin.register(CourseRequirement)
class CourseRequirementAdmin(admin.ModelAdmin):
    list_display = ['course', 'type_badge', 'description_short', 'is_required_badge', 'order']
    list_filter = ['type', 'is_required', 'course']
    search_fields = ['course__title', 'description']
    list_editable = ['order']
    
    def type_badge(self, obj):
        colors = {
            'id_copy': 'blue',
            'matric': 'green',
            'fee': 'orange',
            'maths': 'purple',
            'other': 'gray',
        }
        color = colors.get(obj.type, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">{}</span>',
            color, obj.get_type_display()
        )
    type_badge.short_description = 'Type'
    
    def description_short(self, obj):
        if len(obj.description) > 50:
            return obj.description[:50] + '...'
        return obj.description
    description_short.short_description = 'Description'
    
    def is_required_badge(self, obj):
        if obj.is_required:
            return format_html(
                '<span style="background-color: #EF4444; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">REQUIRED</span>'
            )
        return format_html(
            '<span style="background-color: #6B7280; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">OPTIONAL</span>'
        )
    is_required_badge.short_description = 'Required'

# ========== TEAM MEMBER ADMIN ==========
@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'order', 'is_active_badge', 'social_links']
    list_filter = ['is_active']
    search_fields = ['name', 'position', 'bio']
    ordering = ['order']
    list_editable = ['order']
    
    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background-color: #10B981; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">ACTIVE</span>'
            )
        return format_html(
            '<span style="background-color: #6B7280; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">INACTIVE</span>'
        )
    is_active_badge.short_description = 'Status'
    
    def social_links(self, obj):
        links = []
        if obj.facebook:
            links.append(f'<a href="{obj.facebook}" style="color: #1877F2; margin-right: 5px;">FB</a>')
        if obj.twitter:
            links.append(f'<a href="{obj.twitter}" style="color: #1DA1F2; margin-right: 5px;">TW</a>')
        if obj.linkedin:
            links.append(f'<a href="{obj.linkedin}" style="color: #0077B5;">IN</a>')
        if links:
            return format_html(''.join(links))
        return '-'
    social_links.short_description = 'Social'

# ========== GALLERY IMAGE ADMIN ==========
@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ['thumbnail', 'title', 'category_badge', 'upload_date_formatted', 'is_active_badge']
    list_filter = ['category', 'is_active', 'upload_date']
    search_fields = ['title', 'description']
    readonly_fields = ['upload_date']
    ordering = ['-upload_date']
    
    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />', obj.image.url)
        return '-'
    thumbnail.short_description = 'Image'
    
    def category_badge(self, obj):
        colors = {
            'classroom': 'blue',
            'event': 'green',
            'graduation': 'purple',
            'facility': 'orange',
            'student_work': 'pink',
        }
        color = colors.get(obj.category, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">{}</span>',
            color, obj.get_category_display()
        )
    category_badge.short_description = 'Category'
    
    def upload_date_formatted(self, obj):
        return obj.upload_date.strftime('%d %b %Y')
    upload_date_formatted.short_description = 'Uploaded'
    
    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background-color: #10B981; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">ACTIVE</span>'
            )
        return format_html(
            '<span style="background-color: #6B7280; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">INACTIVE</span>'
        )
    is_active_badge.short_description = 'Status'

# ========== NEWSLETTER ADMIN ==========
@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ['email', 'subscribed_date_formatted', 'is_active_badge']
    list_filter = ['is_active', 'subscribed_at']
    search_fields = ['email']
    readonly_fields = ['subscribed_at']
    ordering = ['-subscribed_at']
    
    actions = ['activate_subscribers', 'deactivate_subscribers']
    
    def subscribed_date_formatted(self, obj):
        return obj.subscribed_at.strftime('%d %b %Y')
    subscribed_date_formatted.short_description = 'Subscribed'
    
    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background-color: #10B981; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">ACTIVE</span>'
            )
        return format_html(
            '<span style="background-color: #6B7280; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">INACTIVE</span>'
        )
    is_active_badge.short_description = 'Status'
    
    def activate_subscribers(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} subscribers activated.')
    activate_subscribers.short_description = "Activate selected subscribers"
    
    def deactivate_subscribers(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} subscribers deactivated.')
    deactivate_subscribers.short_description = "Deactivate selected subscribers"

# ========== NEWS POST ADMIN ==========
@admin.register(NewsPost)
class NewsPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'preview_short', 'is_published', 'created_date_formatted']
    list_filter = ['is_published', 'created_at']
    search_fields = ['title', 'preview_text', 'content']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    list_editable = ['is_published']
    
    fieldsets = (
        ('Content', {
            'fields': ('title', 'preview_text', 'content', 'image')
        }),
        ('Publication', {
            'fields': ('is_published', 'created_at', 'updated_at')
        }),
    )
    
    def preview_short(self, obj):
        if obj.preview_text:
            if len(obj.preview_text) > 60:
                return obj.preview_text[:60] + '...'
            return obj.preview_text
        return '-'
    preview_short.short_description = 'Preview'
    
    def created_date_formatted(self, obj):
        return obj.created_at.strftime('%d %b %Y')
    created_date_formatted.short_description = 'Created'

# ========== DIRECTOR MESSAGE ADMIN ==========
@admin.register(DirectorMessage)
class DirectorMessageAdmin(admin.ModelAdmin):
    list_display = ['quote_short', 'has_video', 'is_active_badge', 'created_date_formatted']
    list_filter = ['is_active', 'created_at']
    search_fields = ['quote']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Message', {
            'fields': ('quote',)
        }),
        ('Video', {
            'fields': ('video_file', 'video_url')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
    
    def quote_short(self, obj):
        if len(obj.quote) > 80:
            return obj.quote[:80] + '...'
        return obj.quote
    quote_short.short_description = 'Message'
    
    def has_video(self, obj):
        if obj.video_file or obj.video_url:
            return format_html('<span style="color: green;">🎥 Video Available</span>')
        return format_html('<span style="color: gray;">No Video</span>')
    has_video.short_description = 'Video'
    
    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background-color: #10B981; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">ACTIVE</span>'
            )
        return format_html(
            '<span style="background-color: #6B7280; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">INACTIVE</span>'
        )
    is_active_badge.short_description = 'Status'
    
    def created_date_formatted(self, obj):
        return obj.created_at.strftime('%d %b %Y')
    created_date_formatted.short_description = 'Created'

# ========== TESTIMONIAL ADMIN ==========
@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['student_name', 'course', 'rating_stars', 'is_featured', 'created_date_formatted']
    list_filter = ['is_featured', 'rating', 'created_at']
    search_fields = ['student_name', 'content']
    ordering = ['-created_at']
    list_editable = ['is_featured']
    
    fieldsets = (
        ('Testimonial', {
            'fields': ('student_name', 'course', 'content', 'rating')
        }),
        ('Status', {
            'fields': ('is_featured', 'created_at')
        }),
    )
    
    def rating_stars(self, obj):
        stars = '⭐' * obj.rating
        return format_html(f'<span style="color: #F59E0B;">{stars}</span>')
    rating_stars.short_description = 'Rating'
    
    def created_date_formatted(self, obj):
        return obj.created_at.strftime('%d %b %Y')
    created_date_formatted.short_description = 'Created'

# ========== VIDEO ADMIN ==========
@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'description_short', 'has_file', 'has_url', 'is_active_badge', 'created_date_formatted']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Video Information', {
            'fields': ('title', 'description', 'thumbnail')
        }),
        ('Video Source', {
            'fields': ('video_file', 'video_url')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at')
        }),
    )
    
    def description_short(self, obj):
        if obj.description:
            if len(obj.description) > 60:
                return obj.description[:60] + '...'
            return obj.description
        return '-'
    description_short.short_description = 'Description'
    
    def has_file(self, obj):
        if obj.video_file:
            return format_html('<span style="color: green;">📁 File Uploaded</span>')
        return format_html('<span style="color: gray;">No File</span>')
    has_file.short_description = 'File'
    
    def has_url(self, obj):
        if obj.video_url:
            return format_html('<span style="color: blue;">🔗 URL Set</span>')
        return format_html('<span style="color: gray;">No URL</span>')
    has_url.short_description = 'URL'
    
    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html(
                '<span style="background-color: #10B981; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">ACTIVE</span>'
            )
        return format_html(
            '<span style="background-color: #6B7280; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">INACTIVE</span>'
        )
    is_active_badge.short_description = 'Status'
    
    def created_date_formatted(self, obj):
        return obj.created_at.strftime('%d %b %Y')
    created_date_formatted.short_description = 'Created'