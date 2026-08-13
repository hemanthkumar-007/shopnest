from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import Product


def success_response(message, data=None, status_code=status.HTTP_200_OK):
    return Response({'success': True, 'message': message, 'data': data or {}}, status=status_code)


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({'success': False, 'message': message}, status=status_code)


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_view(request):
    cart = get_or_create_cart(request.user)
    serializer = CartSerializer(cart, context={'request': request})
    return success_response('Cart retrieved', serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get('product_id')
    quantity = int(request.data.get('quantity', 1))

    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return error_response('Product not found.', status.HTTP_404_NOT_FOUND)

    if product.stock < quantity:
        return error_response(f'Only {product.stock} items in stock.')

    cart = get_or_create_cart(request.user)
    cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

    if not created:
        new_qty = cart_item.quantity + quantity
        if product.stock < new_qty:
            return error_response(f'Only {product.stock} items in stock.')
        cart_item.quantity = new_qty
        cart_item.save()
    else:
        cart_item.quantity = quantity
        cart_item.save()

    serializer = CartSerializer(cart, context={'request': request})
    return success_response('Product added to cart', serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart(request):
    item_id = request.data.get('item_id')
    quantity = int(request.data.get('quantity', 1))

    try:
        cart = Cart.objects.get(user=request.user)
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return error_response('Cart item not found.', status.HTTP_404_NOT_FOUND)

    if quantity <= 0:
        cart_item.delete()
        return success_response('Item removed from cart')

    if cart_item.product.stock < quantity:
        return error_response(f'Only {cart_item.product.stock} items in stock.')

    cart_item.quantity = quantity
    cart_item.save()

    serializer = CartSerializer(cart, context={'request': request})
    return success_response('Cart updated', serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    try:
        cart = Cart.objects.get(user=request.user)
        cart_item = CartItem.objects.get(id=item_id, cart=cart)
        cart_item.delete()
        serializer = CartSerializer(cart, context={'request': request})
        return success_response('Item removed from cart', serializer.data)
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return error_response('Cart item not found.', status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    try:
        cart = Cart.objects.get(user=request.user)
        cart.items.all().delete()
        return success_response('Cart cleared')
    except Cart.DoesNotExist:
        return success_response('Cart is already empty')
