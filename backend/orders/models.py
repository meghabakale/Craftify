import random
from django.db import models
from django.conf import settings
from products.models import Product

class OrderStatus(models.TextChoices):
    CONFIRMED = 'confirmed', 'Order Confirmed'
    PACKED = 'packed', 'Packed'
    SHIPPED = 'shipped', 'Shipped'
    OUT_FOR_DELIVERY = 'out_for_delivery', 'Out for Delivery'
    DELIVERED = 'delivered', 'Delivered'
    CANCELLED = 'cancelled', 'Cancelled'

class Order(models.Model):
    order_number = models.CharField(max_length=100, unique=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    status = models.CharField(max_length=30, choices=OrderStatus.choices, default=OrderStatus.CONFIRMED)
    payout_available = models.BooleanField(default=False) # Delivery-confirmation-triggered payout availability for orders
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    shipping_address_text = models.TextField(blank=True, null=True)
    tracking_reference = models.CharField(max_length=100, blank=True, null=True)
    estimated_delivery_start = models.DateTimeField(blank=True, null=True)
    estimated_delivery_end = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"CF-{random.randint(100000, 999999)}"
        if not self.tracking_reference:
            self.tracking_reference = f"BLUEDART-{random.randint(10000, 99999)}"
        if self.status == OrderStatus.DELIVERED:
            self.payout_available = True
        super().save(*args, **kwargs)

    def mark_delivered(self):
        """Delivery-confirmation-triggered payout availability"""
        self.status = OrderStatus.DELIVERED
        self.payout_available = True
        self.save()
        OrderStatusHistory.objects.create(
            order=self,
            status=OrderStatus.DELIVERED,
            note='Delivery confirmed by customer. Artisan payout released in escrow.'
        )

    def __str__(self):
        return f"Order {self.order_number} ({self.status})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255, default='Handcrafted Product')
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)
    image = models.CharField(max_length=500, blank=True, null=True)

    def __str__(self):
        return f"{self.quantity}x {self.title} in {self.order.order_number}"

class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    status = models.CharField(max_length=30)
    note = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"History for {self.order.order_number}: {self.status}"
