from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from django.db import IntegrityError
import logging
from .models import User, DesignerProfile
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileUpdateSerializer,
    DesignerProfileSerializer,
    DesignerProfileCreateSerializer
)
from apps.common.permissions import IsDesigner

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


class DesignerProfileView(generics.RetrieveUpdateAPIView):
    """Get or update designer profile for current user."""
    serializer_class = DesignerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsDesigner]
    http_method_names = ['get', 'post', 'patch', 'put', 'head', 'options']
    
    def get_object(self):
        """Get or create designer profile for current user."""
        try:
            return DesignerProfile.objects.get(user=self.request.user)
        except DesignerProfile.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        """GET - Return profile or empty structure if doesn't exist"""
        instance = self.get_object()
        if not instance:
            return Response({
                'success': True,
                'data': None,
                'message': 'No profile found. Please create your profile.'
            }, status=status.HTTP_200_OK)
        
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def post(self, request, *args, **kwargs):
        """POST - Create new profile"""
        if request.user.role != 'INTERIOR_DESIGNER':
            return Response({
                'success': False,
                'message': 'Only interior designer users can create designer profiles'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if self.get_object():
            return Response({
                'success': False,
                'message': 'Profile already exists. Use PATCH to update.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = DesignerProfileCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        profile = serializer.save(user=request.user)
        
        return Response({
            'success': True,
            'data': DesignerProfileSerializer(profile).data,
            'message': 'Profile created successfully'
        }, status=status.HTTP_201_CREATED)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DesignerProfileCreateSerializer
        return DesignerProfileSerializer
    
    def update(self, request, *args, **kwargs):
        """PATCH/PUT - Update existing profile"""
        instance = self.get_object()
        if not instance:
            return Response({
                'success': False,
                'message': 'Profile not found. Use POST to create.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        partial = kwargs.pop('partial', False)
        serializer = DesignerProfileCreateSerializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': DesignerProfileSerializer(instance).data,
            'message': 'Profile updated successfully'
        })


class DesignerProfileDetailView(generics.RetrieveAPIView):
    """Get designer profile by ID (public view)."""
    queryset = DesignerProfile.objects.select_related('user').all()
    serializer_class = DesignerProfileSerializer
    permission_classes = [permissions.AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })


# Made with Bob