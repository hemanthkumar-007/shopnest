from django.urls import path
from . import views

urlpatterns = [
    path('', views.wishlist_view, name='wishlist'),
    path('add/', views.add_to_wishlist, name='wishlist-add'),
    path('remove/<int:product_id>/', views.remove_from_wishlist, name='wishlist-remove'),
    path('move-to-cart/<int:product_id>/', views.move_to_cart, name='wishlist-move-to-cart'),
]
