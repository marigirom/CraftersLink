from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, timedelta
from django.utils import timezone

from .models import SavedItem, Notification, Project, ProjectItem
from .serializers import (
    SavedItemSerializer,
    SavedItemCreateSerializer,
    NotificationSerializer,
    ProjectSerializer,
    ProjectCreateSerializer,
    ProjectItemSerializer,
    ProjectItemCreateSerializer,
)
from .permissions import IsDesigner, IsArtisan
from apps.artisans.models import ArtisanProfile, Product
from apps.artisans.serializers import ArtisanListSerializer, ProductListSerializer
from apps.commissions.models import Commission


class SavedItemListView(generics.ListCreateAPIView):
    """List and create saved items - DESIGNER only."""
    serializer_class = SavedItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsDesigner]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product__craft_category', 'product__material']
    ordering_fields = ['saved_at']
    ordering = ['-saved_at']
    
    def get_queryset(self):
        return SavedItem.objects.filter(
            designer=self.request.user
        ).select_related('product__artisan__user')
    
    def create(self, request, *args, **kwargs):
        serializer = SavedItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product_id = serializer.validated_data['product_id']
        
        # Check if already saved
        if SavedItem.objects.filter(designer=request.user, product_id=product_id).exists():
            return Response({
                'success': False,
                'message': 'Item already saved'
            }, status=status.HTTP_200_OK)
        
        # Create saved item
        saved_item = SavedItem.objects.create(
            designer=request.user,
            product_id=product_id
        )
        
        return Response({
            'success': True,
            'data': SavedItemSerializer(saved_item).data,
            'message': 'Item saved successfully'
        }, status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'count': len(serializer.data),
            'results': serializer.data
        })


class SavedItemDeleteView(generics.DestroyAPIView):
    """Remove saved item - DESIGNER only."""
    permission_classes = [permissions.IsAuthenticated, IsDesigner]
    
    def get_queryset(self):
        return SavedItem.objects.filter(designer=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Item removed from saved items'
        }, status=status.HTTP_200_OK)


class NotificationListView(generics.ListAPIView):
    """List user notifications."""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type', 'is_read']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response_data = self.get_paginated_response(serializer.data).data
            response_data['unread_count'] = queryset.filter(is_read=False).count()
            return Response(response_data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'count': len(serializer.data),
            'unread_count': queryset.filter(is_read=False).count(),
            'results': serializer.data
        })


class NotificationMarkReadView(APIView):
    """Mark notification as read."""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.mark_as_read()
            return Response({
                'success': True,
                'message': 'Notification marked as read'
            })
        except Notification.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Notification not found'
            }, status=status.HTTP_404_NOT_FOUND)


class NotificationMarkAllReadView(APIView):
    """Mark all notifications as read."""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({
            'success': True,
            'message': f'{count} notifications marked as read'
        })


class GlobalSearchView(APIView):
    """Global search endpoint - role-aware."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        category = request.query_params.get('category', '')
        county = request.query_params.get('county', '')
        craft = request.query_params.get('craft', '')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        
        results = {'artisans': [], 'products': []}
        
        if not query and not category and not county and not craft:
            return Response({
                'success': True,
                'data': results,
                'message': 'Please provide search parameters'
            })
        
        if request.user.role == 'INTERIOR_DESIGNER':
            # Search artisans
            artisan_query = Q()
            if query:
                artisan_query |= Q(user__first_name__icontains=query)
                artisan_query |= Q(user__last_name__icontains=query)
                artisan_query |= Q(business_name__icontains=query)
                artisan_query |= Q(bio__icontains=query)
            if county:
                artisan_query &= Q(county=county)
            if craft:
                artisan_query &= Q(craft_specialty=craft)
            
            artisans = ArtisanProfile.objects.filter(artisan_query).select_related('user')[:10]
            results['artisans'] = ArtisanListSerializer(artisans, many=True).data
            
            # Search products
            product_query = Q(status__in=['IN_STOCK', 'COMMISSIONABLE'])
            if query:
                product_query &= (
                    Q(name__icontains=query) |
                    Q(description__icontains=query) |
                    Q(tags__icontains=query) |
                    Q(material__icontains=query)
                )
            if category:
                product_query &= Q(craft_category__icontains=category)
            if min_price:
                try:
                    product_query &= Q(price_kes__gte=float(min_price))
                except ValueError:
                    pass
            if max_price:
                try:
                    product_query &= Q(price_kes__lte=float(max_price))
                except ValueError:
                    pass
            
            products = Product.objects.filter(product_query).select_related('artisan__user')[:20]
            results['products'] = ProductListSerializer(products, many=True).data
        
        elif request.user.role == 'ARTISAN':
            # Artisans can only search their own products
            try:
                artisan_profile = request.user.artisan_profile
                product_query = Q(artisan=artisan_profile)
                
                if query:
                    product_query &= (
                        Q(name__icontains=query) |
                        Q(description__icontains=query) |
                        Q(tags__icontains=query)
                    )
                if category:
                    product_query &= Q(craft_category__icontains=category)
                
                products = Product.objects.filter(product_query)
                results['products'] = ProductListSerializer(products, many=True).data
            except ArtisanProfile.DoesNotExist:
                pass

class ArtisanDashboardStatsView(APIView):
    """Get dashboard statistics for artisan."""
    permission_classes = [permissions.IsAuthenticated, IsArtisan]
    
    def get(self, request):
        try:
            artisan_profile = request.user.artisan_profile
            
            # Get total catalogue items
            total_items = Product.objects.filter(artisan=artisan_profile).count()
            
            # Get total enquiries/commissions
            total_enquiries = Commission.objects.filter(artisan=artisan_profile).count()
            
            # Get profile views (last 7 days) - placeholder for now
            profile_views = 0  # TODO: Implement view tracking
            
            # Get average rating
            average_rating = float(artisan_profile.average_rating)
            
            return Response({
                'success': True,
                'data': {
                    'totalItems': total_items,
                    'totalEnquiries': total_enquiries,
                    'profileViews': profile_views,
                    'averageRating': average_rating
                }
            })
        except ArtisanProfile.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Artisan profile not found',
                'data': {
                    'totalItems': 0,
                    'totalEnquiries': 0,
                    'profileViews': 0,
                    'averageRating': 0.0
                }
            }, status=status.HTTP_404_NOT_FOUND)


class DesignerDashboardStatsView(APIView):
    """Get dashboard statistics for designer."""
    permission_classes = [permissions.IsAuthenticated, IsDesigner]
    
    def get(self, request):
        # Get artisans browsed (last 7 days) - placeholder
        artisans_browsed = 0  # TODO: Implement browsing tracking
        
        # Get items saved
        items_saved = SavedItem.objects.filter(designer=request.user).count()
        
        # Get active projects
        active_projects = Project.objects.filter(designer=request.user).count()
        
        # Get pending enquiries
        pending_enquiries = Commission.objects.filter(
            designer=request.user,
            status='PENDING'
        ).count()
        
        return Response({
            'success': True,
            'data': {
                'artisansBrowsed': artisans_browsed,
                'itemsSaved': items_saved,
                'activeProjects': active_projects,
                'pendingEnquiries': pending_enquiries
            }
        })


class ProjectListCreateView(generics.ListCreateAPIView):
    """List and create projects - DESIGNER only."""
    permission_classes = [permissions.IsAuthenticated, IsDesigner]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['created_at', 'updated_at', 'name']
    ordering = ['-updated_at']
    search_fields = ['name', 'description']
    
    def get_queryset(self):
        return Project.objects.filter(designer=self.request.user).prefetch_related('items__product')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjectCreateSerializer
        return ProjectSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        project = serializer.save()
        
        return Response({
            'success': True,
            'data': ProjectSerializer(project).data,
            'message': 'Project created successfully'
        }, status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = ProjectSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = ProjectSerializer(queryset, many=True)
        return Response({
            'success': True,
            'count': len(serializer.data),
            'results': serializer.data
        })


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a project - DESIGNER only."""
    permission_classes = [permissions.IsAuthenticated, IsDesigner]
    
    def get_queryset(self):
        return Project.objects.filter(designer=self.request.user).prefetch_related(
            'items__product',
            'commissions__artisan__user',
            'commissions__reference_product',
        )
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProjectCreateSerializer
        return ProjectSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = ProjectSerializer(instance)
        project_data = serializer.data

        # Attach commissions list to project detail response
        from apps.commissions.models import Commission
        commissions_qs = Commission.objects.filter(project=instance).select_related(
            'artisan__user', 'reference_product'
        ).order_by('-created_at')
        commissions_data = [
            {
                'id': c.id,
                'title': c.title,
                'artisan_name': c.artisan.business_name or c.artisan.user.get_full_name(),
                'item_title': c.reference_product.name if c.reference_product else None,
                'custom_brief': c.custom_brief[:200],
                'budget_kes': float(c.budget_kes),
                'status': c.status,
                'status_display': c.get_status_display(),
                'created_at': c.created_at.isoformat(),
            }
            for c in commissions_qs
        ]
        project_data['commissions'] = commissions_data

        return Response({
            'success': True,
            'data': project_data
        })
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': ProjectSerializer(instance).data,
            'message': 'Project updated successfully'
        })
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Project deleted successfully'
        }, status=status.HTTP_200_OK)


class ProjectItemListCreateView(APIView):
    """Add or list items in a project - DESIGNER only."""
    permission_classes = [permissions.IsAuthenticated, IsDesigner]
    
    def get(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id, designer=request.user)
            items = ProjectItem.objects.filter(project=project).select_related('product__artisan__user')
            serializer = ProjectItemSerializer(items, many=True)
            
            return Response({
                'success': True,
                'count': len(serializer.data),
                'results': serializer.data
            })
        except Project.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Project not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id, designer=request.user)
            serializer = ProjectItemCreateSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            product_id = serializer.validated_data['product_id']
            notes = serializer.validated_data.get('notes', '')
            
            # Check if item already in project
            if ProjectItem.objects.filter(project=project, product_id=product_id).exists():
                return Response({
                    'success': False,
                    'message': 'Item already in project'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Add item to project
            project_item = ProjectItem.objects.create(
                project=project,
                product_id=product_id,
                notes=notes
            )
            
            return Response({
                'success': True,
                'data': ProjectItemSerializer(project_item).data,
                'message': 'Item added to project'
            }, status=status.HTTP_201_CREATED)
            
        except Project.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Project not found'
            }, status=status.HTTP_404_NOT_FOUND)


class ProjectItemDeleteView(APIView):
    """Remove item from project - DESIGNER only."""
    permission_classes = [permissions.IsAuthenticated, IsDesigner]
    
    def delete(self, request, project_id, item_id):
        try:
            project = Project.objects.get(id=project_id, designer=request.user)
            project_item = ProjectItem.objects.get(project=project, product_id=item_id)
            project_item.delete()
            
            return Response({
                'success': True,
                'message': 'Item removed from project'
            }, status=status.HTTP_200_OK)
            
        except Project.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Project not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except ProjectItem.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Item not in project'
            }, status=status.HTTP_404_NOT_FOUND)


class HealthCheckView(APIView):
    """Health check endpoint for monitoring."""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'service': 'crafterslink-api',
            'timestamp': timezone.now().isoformat()
        })

        
        return Response({
            'success': True,
            'data': results,
            'query': query
        })


# Made with Bob