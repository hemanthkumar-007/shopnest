from rest_framework import serializers
from .models import Order, OrderItem, Coupon


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ['id', 'code', 'discount_type', 'discount_value', 'min_order_amount', 'max_discount_amount', 'is_active']


class OrderItemSerializer(serializers.ModelSerializer):
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user_name', 'user_email',
            'items', 'subtotal', 'shipping_cost', 'tax', 'discount', 'coupon_code', 'total_amount',
            'first_name', 'last_name', 'email', 'phone',
            'address', 'city', 'state', 'postal_code', 'country',
            'carrier', 'tracking_number', 'estimated_delivery',
            'order_status', 'payment_status', 'payment_method', 'payment_id', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['order_number', 'carrier', 'tracking_number', 'estimated_delivery', 'created_at', 'updated_at']


class CreateOrderSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    address = serializers.CharField()
    city = serializers.CharField(max_length=100)
    state = serializers.CharField(max_length=100)
    postal_code = serializers.CharField(max_length=20)
    country = serializers.CharField(max_length=100, default='India')
    payment_method = serializers.CharField(default='cod')
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
