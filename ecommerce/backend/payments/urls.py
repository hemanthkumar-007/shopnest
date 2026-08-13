from django.urls import path
from . import views

urlpatterns = [
    path('initiate/', views.initiate_payment, name='payment-initiate'),
    path('verify/', views.verify_payment, name='payment-verify'),
]
