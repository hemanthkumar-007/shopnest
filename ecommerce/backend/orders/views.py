from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from .models import Order, OrderItem, Coupon
from .serializers import OrderSerializer, CreateOrderSerializer, CouponSerializer
from cart.models import Cart


def success_response(message, data=None, status_code=status.HTTP_200_OK):
    return Response({'success': True, 'message': message, 'data': data or {}}, status=status_code)


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({'success': False, 'message': message}, status=status_code)


@api_view(['POST'])
@permission_classes([AllowAny])
def validate_coupon(request):
    code = request.data.get('code', '').strip().upper()
    subtotal = Decimal(str(request.data.get('subtotal', 0)))

    if not code:
        return error_response('Please provide a coupon code.')

    try:
        coupon = Coupon.objects.get(code=code)
    except Coupon.DoesNotExist:
        return error_response('Invalid coupon code.')

    is_valid, msg = coupon.is_valid(subtotal)
    if not is_valid:
        return error_response(msg)

    discount = coupon.calculate_discount(subtotal)
    return success_response('Coupon applied successfully', {
        'code': coupon.code,
        'discount_type': coupon.discount_type,
        'discount_value': float(coupon.discount_value),
        'discount_amount': float(discount),
        'subtotal_after_discount': float(subtotal - discount),
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    serializer = CreateOrderSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    try:
        cart = Cart.objects.get(user=request.user)
    except Cart.DoesNotExist:
        return error_response('Cart is empty.')

    cart_items = cart.items.select_related('product').all()
    if not cart_items.exists():
        return error_response('Cart is empty.')

    # Validate stock
    for item in cart_items:
        if item.product.stock < item.quantity:
            return error_response(f'Only {item.product.stock} units of "{item.product.name}" available.')

    # Calculate totals
    subtotal = sum(item.total_price for item in cart_items)
    shipping_cost = Decimal(0) if subtotal >= Decimal(500) else Decimal(49)

    # Coupon calculation
    discount = Decimal(0)
    coupon_code = serializer.validated_data.get('coupon_code', '').strip().upper()
    if coupon_code:
        try:
            coupon = Coupon.objects.get(code=coupon_code)
            is_valid, _ = coupon.is_valid(subtotal)
            if is_valid:
                discount = Decimal(str(coupon.calculate_discount(subtotal)))
                coupon.times_used += 1
                coupon.save()
        except Coupon.DoesNotExist:
            pass

    taxable_amount = max(Decimal(0), subtotal - discount)
    tax = round(taxable_amount * Decimal('0.18'), 2)
    total_amount = taxable_amount + shipping_cost + tax

    data = serializer.validated_data
    payment_method = data.get('payment_method', 'cod')

    order = Order.objects.create(
        user=request.user,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        tax=tax,
        discount=discount,
        coupon_code=coupon_code,
        total_amount=total_amount,
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        phone=data['phone'],
        address=data['address'],
        city=data['city'],
        state=data['state'],
        postal_code=data['postal_code'],
        country=data.get('country', 'India'),
        payment_method=payment_method,
        notes=data.get('notes', ''),
        payment_status='paid' if payment_method in ['card', 'upi', 'razorpay', 'stripe'] else 'pending',
        order_status='confirmed',
    )

    # Create order items and deduct stock
    for item in cart_items:
        img_url = item.product.external_image_url or (str(item.product.image) if item.product.image else '')
        OrderItem.objects.create(
            order=order,
            product=item.product,
            product_name=item.product.name,
            product_image=img_url,
            quantity=item.quantity,
            price=item.product.discount_price or item.product.price,
        )
        item.product.stock -= item.quantity
        item.product.save()

    # Clear cart
    cart.items.all().delete()

    return success_response(
        'Order placed successfully',
        OrderSerializer(order).data,
        status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_list(request):
    orders = Order.objects.filter(user=request.user).prefetch_related('items')
    serializer = OrderSerializer(orders, many=True)
    return success_response('Orders retrieved', {'orders': serializer.data, 'count': orders.count()})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return error_response('Order not found.', status.HTTP_404_NOT_FOUND)

    serializer = OrderSerializer(order)
    return success_response('Order retrieved', serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return error_response('Order not found.', status.HTTP_404_NOT_FOUND)

    if order.order_status in ['shipped', 'delivered']:
        return error_response('Cannot cancel a shipped or delivered order.')

    if order.order_status == 'cancelled':
        return error_response('Order is already cancelled.')

    # Restore stock
    for item in order.items.select_related('product').all():
        if item.product:
            item.product.stock += item.quantity
            item.product.save()

    order.order_status = 'cancelled'
    order.save()

    return success_response('Order cancelled successfully', OrderSerializer(order).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_order_list(request):
    if not request.user.is_staff:
        return error_response('Admin access required.', status.HTTP_403_FORBIDDEN)

    orders = Order.objects.all().select_related('user').prefetch_related('items')
    status_filter = request.query_params.get('status')
    if status_filter:
        orders = orders.filter(order_status=status_filter)

    serializer = OrderSerializer(orders, many=True)
    return success_response('All orders retrieved', {'orders': serializer.data, 'count': orders.count()})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_order_status(request, order_id):
    if not request.user.is_staff:
        return error_response('Admin access required.', status.HTTP_403_FORBIDDEN)

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return error_response('Order not found.', status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('order_status')
    payment_status = request.data.get('payment_status')

    if new_status:
        order.order_status = new_status
    if payment_status:
        order.payment_status = payment_status
    order.save()

    return success_response('Order updated', OrderSerializer(order).data)
