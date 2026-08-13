from django.urls import path
from . import views

urlpatterns = [
    path('', views.cart_view, name='cart'),
    path('add/', views.add_to_cart, name='cart-add'),
    path('update/', views.update_cart, name='cart-update'),
    path('remove/<int:item_id>/', views.remove_from_cart, name='cart-remove'),
    path('clear/', views.clear_cart, name='cart-clear'),
]
