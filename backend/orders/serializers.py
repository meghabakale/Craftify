from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory
from products.serializers import ProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    price = serializers.FloatField(source='price_at_purchase', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'title', 'price', 'price_at_purchase', 'quantity', 'image']

class OrderStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'status', 'note', 'timestamp']

class OrderSerializer(serializers.ModelSerializer):
    orderNumber = serializers.CharField(source='order_number', read_only=True)
    order_id = serializers.CharField(source='order_number', read_only=True)
    total = serializers.FloatField(source='total_amount', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    trackingHistory = OrderStatusHistorySerializer(source='status_history', many=True, read_only=True)
    orderDate = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'orderNumber', 'order_id', 'status', 'payout_available',
            'total_amount', 'total', 'shipping_address_text', 'tracking_reference',
            'estimated_delivery_start', 'estimated_delivery_end', 'orderDate', 'created_at',
            'items', 'status_history', 'trackingHistory'
        ]

    def get_orderDate(self, obj):
        return obj.created_at.strftime("%b %d, %Y") if obj.created_at else "Recent"
