from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'total_price', 'added_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    subtotal = serializers.ReadOnlyField()
    shipping = serializers.SerializerMethodField()
    tax = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'subtotal', 'shipping', 'tax', 'total', 'updated_at']

    def get_shipping(self, obj):
        return 0 if obj.subtotal >= 500 else 49

    def get_tax(self, obj):
        return round(float(obj.subtotal) * 0.18, 2)

    def get_total(self, obj):
        shipping = self.get_shipping(obj)
        tax = self.get_tax(obj)
        return round(float(obj.subtotal) + shipping + tax, 2)
