from django.urls import path
from . import views

urlpatterns = [
    path('notify/', views.payfast_notify, name='payfast_notify'),
    path('success/', views.payfast_success, name='payfast_success'),
    path('cancel/', views.payfast_cancel, name='payfast_cancel'),
]