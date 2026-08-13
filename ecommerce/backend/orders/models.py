import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from products.models import Product


class Coupon(models.Model):
    DISCOUNT_TYPES = [
        ('percentage', 'Percentage Discount'),
        ('fixed', 'Fixed Amount Discount'),
    ]

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)  # 10% or ₹500
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(default=1000)
    times_used = models.PositiveIntegerField(default=0)

    def is_valid(self, subtotal=0):
        now = timezone.now()
        if not self.is_active:
            return False, 'Coupon is inactive'
        if self.valid_until and now > self.valid_until:
            return False, 'Coupon has expired'
        if self.times_used >= self.usage_limit:
            return False, 'Coupon usage limit reached'
        if subtotal < self.min_order_amount:
            return False, f'Minimum order amount of ₹{self.min_order_amount} required'
        return True, 'Coupon valid'

    def calculate_discount(self, subtotal):
        if self.discount_type == 'percentage':
            discount = (subtotal * self.discount_value) / 100
            if self.max_discount_amount:
                discount = min(discount, self.max_discount_amount)
            return round(discount, 2)
        else:
            return min(self.discount_value, subtotal)

    def __str__(self):
        return f'{self.code} ({self.discount_value}{"%" if self.discount_type == "percentage" else " INR"})'


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('cod', 'Cash on Delivery'),
        ('razorpay', 'Razorpay (Cards/UPI)'),
        ('stripe', 'Stripe (Cards)'),
        ('card', 'Credit / Debit Card'),
        ('upi', 'UPI (Google Pay / PhonePe)'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    coupon_code = models.CharField(max_length=50, blank=True)

    # Shipping address
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='India')

    # Tracking & Delivery
    carrier = models.CharField(max_length=100, default='BlueDart Express')
    tracking_number = models.CharField(max_length=100, blank=True)
    estimated_delivery = models.DateField(null=True, blank=True)

    order_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='confirmed')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='paid')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cod')
    payment_id = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'order_status']),
            models.Index(fields=['order_number']),
        ]

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f'ORD-{uuid.uuid4().hex[:8].upper()}'
        if not self.tracking_number:
            self.tracking_number = f'BD-{uuid.uuid4().hex[:10].upper()}'
        if not self.estimated_delivery:
            self.estimated_delivery = (timezone.now() + timezone.timedelta(days=4)).date()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'Order {self.order_number} by {self.user.email}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=500)  # Snapshot at time of order
    product_image = models.CharField(max_length=1000, blank=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.quantity}x {self.product_name}'

    @property
    def total_price(self):
        return self.price * self.quantity
