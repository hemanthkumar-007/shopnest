from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Product
from .serializers import ProductListSerializer, ProductDetailSerializer, ProductWriteSerializer
from .filters import ProductFilter


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('category')
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'brand', 'category__name']
    ordering_fields = ['price', 'created_at', 'rating', 'review_count']
    ordering = ['-created_at']
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductWriteSerializer
        return ProductListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user and self.request.user.is_staff:
            queryset = Product.objects.all().select_related('category')
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response({
            'success': True,
            'message': 'Product created successfully',
            'data': ProductDetailSerializer(product, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response({
            'success': True,
            'message': 'Product updated successfully',
            'data': ProductDetailSerializer(product, context={'request': request}).data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response({'success': True, 'message': 'Product deleted successfully'})

    @action(detail=False, methods=['get'])
    def featured(self, request):
        products = Product.objects.filter(is_featured=True, is_active=True)[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data})

    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        products = Product.objects.filter(is_active=True).order_by('-created_at')[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data})

    @action(detail=False, methods=['get'])
    def best_sellers(self, request):
        products = Product.objects.filter(is_active=True).order_by('-review_count')[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data})
