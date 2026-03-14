from django.urls import path
from .views import notify_payment, payment_success, payment_cancel

urlpatterns = [
    path('notify/', notify_payment, name='payfast_notify'),
    path('success/', payment_success, name='payfast_success'),
    path('cancel/', payment_cancel, name='payfast_cancel'),
]
