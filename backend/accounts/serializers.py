from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, TrustScore, RiskFlag

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(required=False, allow_blank=True)
    first_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'first_name', 'role', 'craft_type', 'bio', 'phone', 'is_phone_verified', 'is_suspended', 'state', 'city']

    def get_first_name(self, obj):
        if obj.first_name:
            return obj.first_name
        if obj.full_name:
            return obj.full_name.split()[0]
        return obj.username

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'name', 'craft_type', 'bio', 'phone']

    def create(self, validated_data):
        name = validated_data.pop('name', '')
        password = validated_data.pop('password')
        if name and not validated_data.get('full_name'):
            validated_data['full_name'] = name
            parts = name.split(maxsplit=1)
            validated_data['first_name'] = parts[0]
            if len(parts) > 1:
                validated_data['last_name'] = parts[1]

        user = User.objects.create_user(password=password, **validated_data)
        TrustScore.objects.create(artisan=user)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['user'] = UserSerializer(self.user).data
        return data

class TrustScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustScore
        fields = ['artisan', 'score', 'risk_level', 'flags_count', 'last_evaluated']

class RiskFlagSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskFlag
        fields = ['id', 'artisan', 'reason', 'severity', 'is_active', 'created_at']
