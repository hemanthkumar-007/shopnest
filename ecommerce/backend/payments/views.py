from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from orders.models import Order
from .models import Payment
import uuid


def success_response(message, data=None, status_code=status.HTTP_200_OK):
    return Response({'success': True, 'message': message, 'data': data or {}}, status=status_code)


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({'success': False, 'message': message}, status=status_code)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    order_id = request.data.get('order_id')
    payment_method = request.data.get('payment_method', 'cod')

    try:
        order = Order.objects.get(id=order_id, user=request.user)
    except Order.DoesNotExist:
        return error_response('Order not found.', status.HTTP_404_NOT_FOUND)

    if payment_method == 'cod':
        payment = Payment.objects.create(
            order=order,
            user=request.user,
            method='cod',
            status='pending',
            amount=order.total_amount,
            transaction_id=f'COD-{uuid.uuid4().hex[:8].upper()}',
        )
        order.payment_status = 'pending'
        order.order_status = 'confirmed'
        order.save()
        return success_response('Cash on Delivery order confirmed', {
            'transaction_id': payment.transaction_id,
            'order_number': order.order_number,
        })

    elif payment_method == 'razorpay':
        # TODO: Integrate Razorpay
        # import razorpay
        # client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        # razorpay_order = client.order.create({'amount': int(order.total_amount * 100), 'currency': 'INR'})
        return success_response('Razorpay integration pending', {
            'message': 'Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env to enable Razorpay'
        })

    elif payment_method == 'stripe':
        # TODO: Integrate Stripe
        # import stripe
        # stripe.api_key = settings.STRIPE_SECRET_KEY
        return success_response('Stripe integration pending', {
            'message': 'Add STRIPE_SECRET_KEY to .env to enable Stripe'
        })

    return error_response('Invalid payment method.')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """Verify payment from gateway callback."""
    order_id = request.data.get('order_id')
    transaction_id = request.data.get('transaction_id')

    try:
        order = Order.objects.get(id=order_id, user=request.user)
        payment = Payment.objects.get(order=order, transaction_id=transaction_id)
    except (Order.DoesNotExist, Payment.DoesNotExist):
        return error_response('Payment not found.', status.HTTP_404_NOT_FOUND)

    payment.status = 'completed'
    payment.save()
    order.payment_status = 'paid'
    order.order_status = 'confirmed'
    order.save()

    return success_response('Payment verified successfully')
