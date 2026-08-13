from django.contrib import admin
from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 2


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'discount_price', 'stock', 'rating', 'is_featured', 'is_active']
    list_filter = ['category', 'is_featured', 'is_active', 'brand']
    search_fields = ['name', 'brand', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
    list_editable = ['is_featured', 'is_active', 'stock']
    readonly_fields = ['rating', 'review_count', 'created_at', 'updated_at']
