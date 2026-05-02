from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
import re


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone_number', 'profile_image', 'is_verified',
            'date_joined', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified', 'date_joined', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    tokens = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'phone_number',
            'profile_image', 'is_verified', 'created_at', 'tokens'
        ]
        read_only_fields = ['id', 'is_verified', 'created_at', 'tokens']
    
    def validate_username(self, value):
        """Validate username format"""
        if not re.match(r'^[a-zA-Z0-9_]{3,150}$', value):
            raise serializers.ValidationError(
                "Username must be 3-150 characters and contain only letters, numbers, and underscores"
            )
        return value
    
    def validate_phone_number(self, value):
        """Validate Kenyan phone number format"""
        if value and not re.match(r'^\+254[17]\d{8}$|^07\d{8}$', value):
            raise serializers.ValidationError(
                "Phone number must be in Kenyan format (+254XXXXXXXXX or 07XXXXXXXX)"
            )
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match"})
        return attrs
    
    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user
    
    def get_tokens(self, obj):
        """Generate JWT tokens for user"""
        refresh = RefreshToken.for_user(obj)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        """Validate user credentials"""
        from django.contrib.auth import authenticate
        
        email = attrs.get('email')
        password = attrs.get('password')
        
        user = authenticate(username=email, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        
        attrs['user'] = user
        return attrs


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone_number', 'profile_image']
    
    def validate_phone_number(self, value):
        """Validate Kenyan phone number format"""
        if value and not re.match(r'^\+254[17]\d{8}$|^07\d{8}$', value):
            raise serializers.ValidationError(
                "Phone number must be in Kenyan format (+254XXXXXXXXX or 07XXXXXXXX)"
            )
        return value


# Made with Bob