from rest_framework import serializers
from .models import Product, ProductReview

class ProductReviewSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author_name', read_only=True)
    date = serializers.SerializerMethodField()

    class Meta:
        model = ProductReview
        fields = ['id', 'author', 'rating', 'title', 'comment', 'verified_buyer', 'date']

    def get_date(self, obj):
        return obj.created_at.strftime("%b %d, %Y") if obj.created_at else "Recent"

class ProductSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source='name', read_only=True)
    artisan = serializers.SerializerMethodField()
    reviews = ProductReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'title', 'sku', 'artisan', 'campaign', 'price', 'description',
            'category', 'craft_heritage_note', 'region_state', 'in_stock', 'stock_quantity',
            'is_funded_on_platform', 'average_rating', 'reviews_count', 'image',
            'gallery_images', 'reviews', 'created_at'
        ]

    def get_artisan(self, obj):
        return {
            'id': obj.artisan.id,
            'username': obj.artisan.username,
            'full_name': obj.artisan.full_name or obj.artisan.username,
        }
