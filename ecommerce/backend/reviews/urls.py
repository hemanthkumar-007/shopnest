from django.urls import path
from . import views

urlpatterns = [
    path('products/<int:product_id>/reviews/', views.product_reviews, name='product-reviews'),
    path('<int:review_id>/', views.review_detail, name='review-detail'),
]
