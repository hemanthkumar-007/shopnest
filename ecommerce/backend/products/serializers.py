from rest_framework import serializers
from .models import Product, ProductImage
from categories.serializers import CategorySerializer


class ProductImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'external_image_url', 'image_url', 'alt_text', 'order']

    def get_image_url(self, obj):
        if obj.external_image_url:
            return obj.external_image_url
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    image_url = serializers.SerializerMethodField()
    discount_percentage = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()
    effective_price = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'discount_price', 'effective_price',
            'discount_percentage', 'image_url', 'rating', 'review_count',
            'category_name', 'category_slug', 'brand', 'stock', 'in_stock',
            'is_featured', 'highlights', 'created_at'
        ]

    def get_image_url(self, obj):
        if obj.external_image_url:
            return obj.external_image_url
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    additional_images = ProductImageSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    discount_percentage = serializers.ReadOnlyField()
    in_stock = serializers.ReadOnlyField()
    effective_price = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'discount_price',
            'effective_price', 'discount_percentage', 'stock', 'in_stock',
            'category', 'brand', 'image', 'external_image_url', 'image_url', 'additional_images',
            'rating', 'review_count', 'is_featured', 'is_active',
            'specifications', 'highlights', 'created_at', 'updated_at'
        ]

    def get_image_url(self, obj):
        if obj.external_image_url:
            return obj.external_image_url
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'discount_price', 'stock',
            'category', 'brand', 'image', 'external_image_url', 'is_featured',
            'is_active', 'specifications', 'highlights'
        ]
