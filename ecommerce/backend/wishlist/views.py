from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Wishlist
from products.models import Product
from products.serializers import ProductListSerializer
from cart.models import Cart, CartItem


def success_response(message, data=None, status_code=status.HTTP_200_OK):
    return Response({'success': True, 'message': message, 'data': data or {}}, status=status_code)


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({'success': False, 'message': message}, status=status_code)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_view(request):
    wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
    products = wishlist.products.filter(is_active=True)
    serializer = ProductListSerializer(products, many=True, context={'request': request})
    return success_response('Wishlist retrieved', {
        'count': products.count(),
        'products': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_wishlist(request):
    product_id = request.data.get('product_id')
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return error_response('Product not found.', status.HTTP_404_NOT_FOUND)

    wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
    if product in wishlist.products.all():
        return success_response('Product already in wishlist')

    wishlist.products.add(product)
    return success_response('Product added to wishlist')


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_wishlist(request, product_id):
    try:
        wishlist = Wishlist.objects.get(user=request.user)
        product = Product.objects.get(id=product_id)
        wishlist.products.remove(product)
        return success_response('Product removed from wishlist')
    except (Wishlist.DoesNotExist, Product.DoesNotExist):
        return error_response('Not found.', status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def move_to_cart(request, product_id):
    try:
        wishlist = Wishlist.objects.get(user=request.user)
        product = Product.objects.get(id=product_id, is_active=True)
    except (Wishlist.DoesNotExist, Product.DoesNotExist):
        return error_response('Product not found.', status.HTTP_404_NOT_FOUND)

    if product.stock < 1:
        return error_response('Product is out of stock.')

    wishlist.products.remove(product)
    cart, _ = Cart.objects.get_or_create(user=request.user)
    cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        cart_item.quantity += 1
        cart_item.save()

    return success_response('Product moved to cart')
