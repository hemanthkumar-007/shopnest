from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Review
from .serializers import ReviewSerializer
from products.models import Product


def success_response(message, data=None, status_code=status.HTTP_200_OK):
    return Response({'success': True, 'message': message, 'data': data or {}}, status=status_code)


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST):
    return Response({'success': False, 'message': message}, status=status_code)


@api_view(['GET', 'POST'])
def product_reviews(request, product_id):
    try:
        product = Product.objects.get(id=product_id, is_active=True)
    except Product.DoesNotExist:
        return error_response('Product not found.', status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        reviews = Review.objects.filter(product=product).select_related('user')
        serializer = ReviewSerializer(reviews, many=True)
        return success_response('Reviews retrieved', {
            'reviews': serializer.data,
            'count': reviews.count(),
            'average_rating': float(product.rating),
        })

    # POST - create review
    if not request.user.is_authenticated:
        return error_response('Authentication required.', status.HTTP_401_UNAUTHORIZED)

    if Review.objects.filter(user=request.user, product=product).exists():
        return error_response('You have already reviewed this product.')

    serializer = ReviewSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=request.user, product=product)
        return success_response('Review submitted', serializer.data, status.HTTP_201_CREATED)
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def review_detail(request, review_id):
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        return error_response('Review not found.', status.HTTP_404_NOT_FOUND)

    if review.user != request.user and not request.user.is_staff:
        return error_response('Permission denied.', status.HTTP_403_FORBIDDEN)

    if request.method == 'DELETE':
        review.delete()
        return success_response('Review deleted')

    serializer = ReviewSerializer(review, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return success_response('Review updated', serializer.data)
    return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
