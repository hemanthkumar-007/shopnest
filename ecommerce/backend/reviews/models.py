from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from products.models import Product


class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'product']
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.product.name} ({self.rating}/5)'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self._update_product_rating()

    def delete(self, *args, **kwargs):
        product = self.product
        super().delete(*args, **kwargs)
        self._update_product_rating(product)

    def _update_product_rating(self, product=None):
        product = product or self.product
        reviews = Review.objects.filter(product=product)
        count = reviews.count()
        if count > 0:
            avg = sum(r.rating for r in reviews) / count
            product.rating = round(avg, 2)
        else:
            product.rating = 0
        product.review_count = count
        product.save()
