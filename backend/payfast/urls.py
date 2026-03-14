from django.urls import path
from .views import notify_payment, payment_success, payment_cancel

urlpatterns = [
    path('notify/', views.notify_payment, name='payfast_notify'),
    path('create/', views.create_payfast_payment, name='payfast_create'),
    path('success/', views.payment_success, name='payfast_success'),
    path('cancel/', views.payment_cancel, name='payfast_cancel'),
]
