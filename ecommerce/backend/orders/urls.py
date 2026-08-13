from django.urls import path
from . import views

urlpatterns = [
    path('coupons/validate/', views.validate_coupon, name='coupon-validate'),
    path('create/', views.create_order, name='order-create'),
    path('', views.order_list, name='order-list'),
    path('<int:order_id>/', views.order_detail, name='order-detail'),
    path('<int:order_id>/cancel/', views.cancel_order, name='order-cancel'),
    path('admin/all/', views.admin_order_list, name='admin-order-list'),
    path('admin/<int:order_id>/status/', views.update_order_status, name='admin-order-status'),
]
