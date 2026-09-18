from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q

from .models import Product
from .serializers import ProductSerializer
from accounts.models import User

class ProductListCreateView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        products = Product.objects.all().order_by('-created_at')
        serializer = ProductSerializer(products, many=True)
        return Response({
            'count': len(serializer.data),
            'next': None,
            'previous': None,
            'results': serializer.data
        })

    def post(self, request):
        data = request.data or {}
        user = request.user if request.user.is_authenticated else User.objects.filter(role__in=['artisan', 'admin']).first()
        if not user:
            user = User.objects.first()

        name = data.get('name') or data.get('title') or 'Handcrafted Artifact'
        price = float(data.get('price') or 1500)
        desc = data.get('description') or ''
        category = data.get('category') or 'Home & Living'
        craft = data.get('craft_type') or 'Traditional Craft'
        region = data.get('region_state') or 'India'
        stock = int(data.get('stock_quantity') or 10)
        image = data.get('image') or data.get('imageUrl') or '/images/products/jaipur-blue-pottery-tea-set.jpg'

        product = Product.objects.create(
            name=name,
            artisan=user,
            price=price,
            description=desc,
            category=category,
            craft_heritage_note=craft,
            region_state=region,
            in_stock=stock > 0,
            stock_quantity=stock,
            image=image,
            gallery_images=[image]
        )

        serializer = ProductSerializer(product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ProductDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        product = Product.objects.filter(Q(id=pk) | Q(sku=pk)).first()
        if not product:
            return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
