from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from .serializers import RegisterSerializer, UserProfileSerializer, ChangePasswordSerializer

User = get_user_model()


def success_response(message, data=None, status_code=status.HTTP_200_OK):
    return Response({
        'success': True,
        'message': message,
        'data': data or {}
    }, status=status_code)


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({
        'success': False,
        'message': message
    }, status=status_code)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return success_response(
            'Registration successful',
            {
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            },
            status.HTTP_201_CREATED
        )
    return Response({'success': False, 'message': 'Validation error', 'errors': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return error_response('Email and password are required.')

    user = authenticate(request, username=email, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return success_response(
            'Login successful',
            {
                'user': UserProfileSerializer(user, context={'request': request}).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }
        )
    return error_response('Invalid email or password.', status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return success_response('Logged out successfully.')
    except Exception:
        return error_response('Invalid token.', status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    user = request.user
    if request.method == 'GET':
        serializer = UserProfileSerializer(user, context={'request': request})
        return success_response('Profile retrieved', serializer.data)

    serializer = UserProfileSerializer(user, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return success_response('Profile updated', serializer.data)
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return error_response('Current password is incorrect.')
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return success_response('Password changed successfully.')
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats_view(request):
    if not request.user.is_staff:
        return error_response('Admin access required.', status.HTTP_403_FORBIDDEN)

    from products.models import Product
    from orders.models import Order
    from django.db.models import Sum

    total_users = User.objects.count()
    total_products = Product.objects.count()
    total_orders = Order.objects.count()
    total_revenue = Order.objects.filter(
        payment_status='paid'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    pending_orders = Order.objects.filter(order_status='pending').count()
    delivered_orders = Order.objects.filter(order_status='delivered').count()

    return success_response('Admin stats', {
        'total_users': total_users,
        'total_products': total_products,
        'total_orders': total_orders,
        'total_revenue': float(total_revenue),
        'pending_orders': pending_orders,
        'delivered_orders': delivered_orders,
    })
