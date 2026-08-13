from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'image_url', 'product_count', 'is_active']

    def get_image_url(self, obj):
        if obj.external_image_url:
            return obj.external_image_url
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()
