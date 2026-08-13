from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['transaction_id', 'order', 'user', 'method', 'status', 'amount', 'created_at']
    list_filter = ['method', 'status', 'created_at']
    search_fields = ['transaction_id', 'order__order_number', 'user__email']
    readonly_fields = ['created_at', 'gateway_response']
