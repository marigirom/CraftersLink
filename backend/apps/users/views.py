from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from django.db import IntegrityError
import logging
from .models import User
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileUpdateSerializer
)

logger = logging.getLogger(__name__)


class UserRegistrationView(generics.CreateAPIView):
    """Register a new user (Designer or Artisan)"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        try:
            logger.info(f"Registration attempt for email: {request.data.get('email')}")
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            logger.info(f"User registered successfully: {user.email}")
            
            return Response({
                'success': True,
                'data': {
                    'user': UserSerializer(user).data,
                    'tokens': serializer.get_tokens(user)
                },
                'message': 'User registered successfully'
            }, status=status.HTTP_201_CREATED)
        
        except IntegrityError as e:
            logger.error(f"Registration integrity error: {str(e)}")
            error_message = "Registration failed"
            
            if 'email' in str(e).lower():
                error_message = "Email address is already registered"
            elif 'username' in str(e).lower():
                error_message = "Username is already taken"
            
            return Response({
                'success': False,
                'message': error_message,
                'errors': {'detail': error_message}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.error(f"Registration error: {str(e)}", exc_info=True)
            return Response({
                'success': False,
                'message': 'Registration failed. Please try again.',
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserLoginView(APIView):
    """Authenticate user and return JWT tokens"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            logger.info(f"Login attempt for email: {request.data.get('email')}")
            
            serializer = UserLoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"User logged in successfully: {user.email}")
            
            return Response({
                'success': True,
                'data': {
                    'user': UserSerializer(user).data,
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                },
                'message': 'Login successful'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Login failed',
                'errors': {'detail': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """Get or update current authenticated user"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return UserProfileUpdateSerializer
        return UserSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': UserSerializer(instance).data,
            'message': 'Profile updated successfully'
        })


# Made with Bob