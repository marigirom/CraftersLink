from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import ArtisanProfile, Product
from .serializers import (
    ArtisanProfileSerializer,
    ArtisanProfileCreateSerializer,
    ArtisanListSerializer,
    ProductSerializer,
    ProductCreateSerializer,
    ProductListSerializer
)


class IsArtisanOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow artisans to edit"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.role == 'ARTISAN'


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow owners to edit"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'artisan'):
            return obj.artisan.user == request.user
        return False


class ArtisanProfileListView(generics.ListAPIView):
    """List all artisan profiles with filtering"""
    queryset = ArtisanProfile.objects.select_related('user').all()
    serializer_class = ArtisanListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['county', 'craft_specialty']
    search_fields = ['user__first_name', 'user__last_name', 'bio', 'business_name']
    ordering_fields = ['average_rating', 'total_commissions', 'created_at']
    ordering = ['-average_rating']
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': len(serializer.data),
            'next': None,
            'previous': None,
            'results': serializer.data
        })


class ArtisanProfileDetailView(generics.RetrieveUpdateAPIView):
    """Get or update artisan profile"""
    queryset = ArtisanProfile.objects.select_related('user').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ArtisanProfileCreateSerializer
        return ArtisanProfileSerializer
    
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
            'data': ArtisanProfileSerializer(instance).data,
            'message': 'Artisan profile updated successfully'
        })


class ArtisanProfileCreateView(generics.CreateAPIView):
    """Create artisan profile"""
    queryset = ArtisanProfile.objects.all()
    serializer_class = ArtisanProfileCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsArtisanOrReadOnly]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        
        return Response({
            'success': True,
            'data': ArtisanProfileSerializer(profile).data,
            'message': 'Artisan profile created successfully'
        }, status=status.HTTP_201_CREATED)


class ProductListView(generics.ListAPIView):
    """List all products with filtering"""
    queryset = Product.objects.select_related('artisan__user').all()
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'craft_category', 'material', 'artisan']
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['price_kes', 'views_count', 'commission_count', 'created_at']
    ordering = ['-created_at']
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': len(serializer.data),
            'next': None,
            'previous': None,
            'results': serializer.data
        })


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete product"""
    queryset = Product.objects.select_related('artisan__user').all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateSerializer
        return ProductSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view count
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Prevent editing sold products
        if instance.status == Product.ProductStatus.SOLD:
            return Response({
                'success': False,
                'message': 'Cannot edit sold products'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': ProductSerializer(instance).data,
            'message': 'Product updated successfully'
        })
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Product deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)


class ProductCreateView(generics.CreateAPIView):
    """Create new product"""
    queryset = Product.objects.all()
    serializer_class = ProductCreateSerializer
    permission_classes = [permissions.IsAuthenticated, IsArtisanOrReadOnly]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        
        return Response({
            'success': True,
            'data': ProductSerializer(product).data,
            'message': 'Product created successfully'
        }, status=status.HTTP_201_CREATED)


# Made with Bob