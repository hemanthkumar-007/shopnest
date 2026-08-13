from django.db import models
from django.utils.text import slugify
from categories.models import Category


class Product(models.Model):
    name = models.CharField(max_length=500)
    slug = models.SlugField(max_length=500, unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    brand = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    external_image_url = models.URLField(max_length=1000, blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    review_count = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    specifications = models.JSONField(default=dict, blank=True)
    highlights = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['is_active']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            n = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f'{base_slug}-{n}'
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def effective_price(self):
        return self.discount_price if self.discount_price else self.price

    @property
    def discount_percentage(self):
        if self.discount_price and self.price > 0:
            return round((1 - self.discount_price / self.price) * 100)
        return 0

    @property
    def in_stock(self):
        return self.stock > 0

    @property
    def primary_image_url(self):
        if self.external_image_url:
            return self.external_image_url
        if self.image:
            return self.image.url
        return None


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='additional_images')
    image = models.ImageField(upload_to='products/gallery/', blank=True, null=True)
    external_image_url = models.URLField(max_length=1000, blank=True, null=True)
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.product.name} - Image {self.id}'

    @property
    def image_url(self):
        if self.external_image_url:
            return self.external_image_url
        if self.image:
            return self.image.url
        return None
