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
    ProductListSerializer,
    CatalogueItemSerializer,
    ArtisanWithProductsSerializer
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


class ArtisanProfileMeView(generics.RetrieveUpdateAPIView):
    """Get, create, or update current user's artisan profile"""
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put', 'head', 'options']
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH', 'POST']:
            return ArtisanProfileCreateSerializer
        return ArtisanProfileSerializer
    
    def get_object(self):
        try:
            return ArtisanProfile.objects.select_related('user').get(user=self.request.user)
        except ArtisanProfile.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        """GET - Return profile or null if doesn't exist"""
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
        # Check if user is artisan
        if request.user.role != 'ARTISAN':
            return Response({
                'success': False,
                'message': 'Only artisan users can create artisan profiles'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if profile already exists
        if self.get_object():
            return Response({
                'success': False,
                'message': 'Profile already exists. Use PATCH to update.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        
        return Response({
            'success': True,
            'data': ArtisanProfileSerializer(profile).data,
            'message': 'Profile created successfully'
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """PATCH/PUT - Update existing profile"""
        instance = self.get_object()
        if not instance:
            return Response({
                'success': False,
                'message': 'Profile not found. Use POST to create.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': ArtisanProfileSerializer(instance).data,
            'message': 'Profile updated successfully'
        })


class ProductListView(generics.ListAPIView):
    """List all products with filtering - supports artisan filtering"""
    queryset = Product.objects.select_related('artisan__user').all()
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'craft_category', 'material', 'artisan']
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['price_kes', 'views_count', 'commission_count', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Override to support filtering by current artisan"""
        queryset = super().get_queryset()
        
        # If user is authenticated and is an artisan, optionally filter by their ID
        if self.request.user.is_authenticated and self.request.user.role == 'ARTISAN':
            # Check if artisan parameter matches current user
            artisan_param = self.request.query_params.get('artisan')
            if artisan_param:
                try:
                    # If artisan param is provided, use it for filtering
                    queryset = queryset.filter(artisan_id=artisan_param)
                except ValueError:
                    pass
        
        return queryset
    
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
    
    def perform_create(self, serializer):
        """Automatically set artisan to current user's profile"""
        user = self.request.user
        
        # Verify user has artisan profile
        if not hasattr(user, 'artisan_profile'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError({
                "error": "Artisan profile not found. Please create your profile first.",
                "detail": "You must complete your artisan profile before creating products."
            })
        
        serializer.save(artisan=user.artisan_profile)
    
    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            return Response({
                'success': True,
                'data': ProductSerializer(serializer.instance, context={'request': request}).data,
                'message': 'Product created successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e),
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class CatalogueListView(generics.ListAPIView):
    """List all catalogue items (products) for browsing"""
    queryset = Product.objects.select_related('artisan__user').filter(
        status__in=['IN_STOCK', 'COMMISSIONABLE']
    )
    serializer_class = CatalogueItemSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['craft_category', 'artisan']
    search_fields = ['name', 'description', 'tags', 'artisan__business_name']
    ordering_fields = ['price_kes', 'views_count', 'created_at']
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


class CatalogueItemDetailView(generics.RetrieveAPIView):
    """Get detailed catalogue item with artisan info"""
    queryset = Product.objects.select_related('artisan__user').all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'pk'
    lookup_url_kwarg = 'item_id'
    
    def retrieve(self, request, *args, **kwargs):
        # Get item_id from URL kwargs
        item_id = kwargs.get('item_id')
        artisan_id = kwargs.get('artisan_id')
        
        try:
            # Fetch product and verify it belongs to the artisan
            instance = Product.objects.select_related('artisan__user').get(
                id=item_id,
                artisan_id=artisan_id
            )
        except Product.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Item not found or does not belong to this artisan'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Increment view count
        instance.increment_views()
        
        # Get product data
        product_serializer = self.get_serializer(instance)
        product_data = product_serializer.data
        
        # Get artisan mini profile
        artisan_data = {
            'id': instance.artisan.id,
            'user': {
                'full_name': instance.artisan.user.get_full_name(),
                'profile_image': instance.artisan.user.profile_image if hasattr(instance.artisan.user, 'profile_image') else None
            },
            'business_name': instance.artisan.business_name,
            'county_display': instance.artisan.get_county_display(),
            'town': instance.artisan.town,
            'average_rating': float(instance.artisan.average_rating),
            'total_commissions': instance.artisan.total_commissions
        }
        
        return Response({
            'success': True,
            'data': {
                **product_data,
                'artisan_profile': artisan_data
            }
        })


class ArtisanCatalogueView(generics.RetrieveAPIView):
    """Get artisan profile with all their catalogue items"""
    queryset = ArtisanProfile.objects.select_related('user').prefetch_related('products').all()
    serializer_class = ArtisanWithProductsSerializer
    permission_classes = [permissions.AllowAny]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })


# Made with Bob