from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q

from .models import Order, OrderItem, OrderStatusHistory, OrderStatus
from .serializers import OrderSerializer
from products.models import Product

class OrderListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            orders = Order.objects.filter(user=request.user).order_by('-created_at')
        else:
            orders = Order.objects.all().order_by('-created_at')
        
        serializer = OrderSerializer(orders, many=True)
        return Response({
            'count': len(serializer.data),
            'next': None,
            'previous': None,
            'results': serializer.data
        })

    def post(self, request):
        data = request.data or {}
        items_data = data.get('items', [])
        total = float(data.get('total_amount') or 2499)
        addr = data.get('shipping_address') or '123 Craft Lane, Bengaluru, Karnataka, India'
        if isinstance(addr, dict):
            addr_str = f"{addr.get('name', 'Customer')}\n{addr.get('street', '123 Craft Lane')}\n{addr.get('city', 'Bengaluru')}, {addr.get('state', 'Karnataka')} {addr.get('zip', '560001')}, {addr.get('country', 'India')}"
        else:
            addr_str = str(addr)

        user = request.user if request.user.is_authenticated else None

        order = Order.objects.create(
            user=user,
            total_amount=total,
            shipping_address_text=addr_str,
            status=OrderStatus.CONFIRMED
        )

        OrderStatusHistory.objects.create(
            order=order,
            status=OrderStatus.CONFIRMED,
            note='Payment secured in escrow. Artisan notified.'
        )

        for it in items_data:
            prod_id = it.get('product') or it.get('productId') or it.get('id')
            prod = Product.objects.filter(pk=prod_id).first() if prod_id else None
            title = it.get('title') or (prod.name if prod else 'Handcrafted Masterpiece')
            price = float(it.get('price_at_purchase') or it.get('price') or (prod.price if prod else 1500))
            qty = int(it.get('quantity') or 1)
            img = it.get('imageUrl') or (prod.image if prod else None)

            OrderItem.objects.create(
                order=order,
                product=prod,
                title=title,
                price_at_purchase=price,
                quantity=qty,
                image=img
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class OrderDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        order = Order.objects.filter(Q(id=pk) | Q(order_number=pk)).first()
        if not order:
            return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = OrderSerializer(order)
        return Response(serializer.data)

class OrderCancelView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        order = Order.objects.filter(Q(id=pk) | Q(order_number=pk)).first()
        if not order:
            return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        reason = request.data.get('reason') or 'Cancelled by customer request.'
        order.status = OrderStatus.CANCELLED
        order.save()

        OrderStatusHistory.objects.create(
            order=order,
            status=OrderStatus.CANCELLED,
            note=reason
        )

        return Response({
            'status': 'success',
            'order': OrderSerializer(order).data
        })

class OrderConfirmDeliveryView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk):
        order = Order.objects.filter(Q(id=pk) | Q(order_number=pk)).first()
        if not order:
            return Response({'detail': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        # Delivery-confirmation-triggered payout availability
        order.mark_delivered()

        return Response({
            'status': 'success',
            'message': 'Delivery confirmed by buyer. Payout unlocked for artisan.',
            'order': OrderSerializer(order).data
        })
