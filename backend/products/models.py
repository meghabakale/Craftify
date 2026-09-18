from django.db import models
from django.conf import settings
from campaigns.models import Campaign

class Product(models.Model):
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True, blank=True)
    artisan = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products')
    campaign = models.ForeignKey(Campaign, on_delete=models.SET_NULL, null=True, blank=True, related_name='graduated_products')
    price = models.DecimalField(max_digits=10, decimal_places=2, default=1500.00)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=255, default='Home & Living')
    craft_heritage_note = models.CharField(max_length=255, default='Traditional Craft')
    region_state = models.CharField(max_length=255, default='India')
    in_stock = models.BooleanField(default=True)
    stock_quantity = models.IntegerField(default=10)
    is_funded_on_platform = models.BooleanField(default=True)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.90)
    reviews_count = models.IntegerField(default=12)
    image = models.CharField(max_length=500, default='/images/products/jaipur-blue-pottery-tea-set.jpg')
    gallery_images = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.sku:
            import random
            self.sku = f"LM-{random.randint(100, 999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.sku})"

class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    author_name = models.CharField(max_length=255, default='Conscious Buyer')
    rating = models.IntegerField(default=5)
    title = models.CharField(max_length=255, default='Exceptional Quality')
    comment = models.TextField()
    verified_buyer = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.product.name} by {self.author_name}"
