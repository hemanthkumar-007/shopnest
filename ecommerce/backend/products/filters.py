import django_filters
from .models import Product


class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    category = django_filters.CharFilter(field_name='category__slug', lookup_expr='exact')
    brand = django_filters.CharFilter(field_name='brand', lookup_expr='icontains')
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    is_featured = django_filters.BooleanFilter(field_name='is_featured')

    class Meta:
        model = Product
        fields = ['category', 'brand', 'min_price', 'max_price', 'min_rating', 'in_stock', 'is_featured']

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset.filter(stock=0)
