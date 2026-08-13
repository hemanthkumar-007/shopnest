"""
URL configuration for ShopNest E-Commerce project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    return Response({
        'message': 'Welcome to ShopNest E-Commerce REST API',
        'documentation': {
            'swagger_ui': request.build_absolute_uri('/api/docs/'),
            'redoc': request.build_absolute_uri('/api/redoc/'),
            'schema': request.build_absolute_uri('/api/schema/'),
        },
        'endpoints': {
            'auth': request.build_absolute_uri('/api/auth/'),
            'categories': request.build_absolute_uri('/api/categories/'),
            'products': request.build_absolute_uri('/api/products/'),
            'cart': request.build_absolute_uri('/api/cart/'),
            'wishlist': request.build_absolute_uri('/api/wishlist/'),
            'orders': request.build_absolute_uri('/api/orders/'),
            'payments': request.build_absolute_uri('/api/payments/'),
            'reviews': request.build_absolute_uri('/api/reviews/'),
            'admin': request.build_absolute_uri('/admin/'),
        }
    })

urlpatterns = [
    # Root & API Root
    path('', api_root, name='root'),
    path('api/', api_root, name='api-root'),

    # Django Admin
    path('admin/', admin.site.urls),

    # API Schema / Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # App APIs
    path('api/auth/', include('users.urls')),
    path('api/categories/', include('categories.urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/wishlist/', include('wishlist.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/reviews/', include('reviews.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

