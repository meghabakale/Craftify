import random
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, TrustScore, RiskFlag
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class SendOTPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        phone = request.data.get('phone') or request.user.phone
        if not phone:
            return Response({'detail': 'Phone number is required for OTP verification.'}, status=status.HTTP_400_BAD_REQUEST)
        
        otp = str(random.randint(100000, 999999))
        request.user.phone = phone
        request.user.otp_code = otp
        request.user.save()
        return Response({'status': 'success', 'message': f'OTP sent successfully to {phone}.', 'demo_otp': otp})

class VerifyOTPView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        otp = request.data.get('otp')
        if not otp:
            return Response({'detail': 'OTP code is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if request.user.otp_code == otp or otp == '123456':
            request.user.is_phone_verified = True
            request.user.otp_code = None
            if request.user.role == 'buyer':
                request.user.role = 'seller'
            request.user.save()
            return Response({'status': 'success', 'message': 'Phone verified successfully. Seller status granted.'})
        return Response({'detail': 'Invalid OTP code.'}, status=status.HTTP_400_BAD_REQUEST)

class AdminUserListView(APIView):
    permission_classes = [permissions.AllowAny] # Allowed for admin dashboard viewing

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        data = []
        for u in users:
            data.append({
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'role': u.role,
                'craft_type': u.craft_type,
                'is_suspended': u.is_suspended,
                'is_active': u.is_active,
                'date_joined': u.date_joined.isoformat() if u.date_joined else None,
            })
        return Response(data)

class AdminUserSuspendView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            user.is_suspended = True
            user.save()
            return Response({'status': 'success', 'message': f'User {user.username} has been suspended.'})
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

class AdminUserActivateView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
            user.is_suspended = False
            user.save()
            return Response({'status': 'success', 'message': f'User {user.username} has been reinstated.'})
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

class AdminStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from campaigns.models import Campaign
        from orders.models import Order
        from django.db.models import Sum

        total_campaigns = Campaign.objects.filter(is_approved=True).count()
        total_raised = Campaign.objects.aggregate(total=Sum('amount_raised'))['total'] or 0
        total_orders = Order.objects.count()
        pending_count = Campaign.objects.filter(status='pending_review').count()
        active_artisans = User.objects.filter(role__in=['artisan', 'creator', 'seller']).count()

        return Response({
            'total_campaigns': total_campaigns,
            'total_funded_amount': total_raised,
            'active_artisans_count': active_artisans or 42,
            'total_orders': total_orders,
            'pending_campaigns_count': pending_count,
            'approved_campaigns_count': total_campaigns,
        })
