from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Commission, Milestone
from .serializers import (
    CommissionSerializer,
    CommissionCreateSerializer,
    CommissionListSerializer,
    CommissionStatusUpdateSerializer,
    MilestoneSerializer,
    MilestoneUpdateSerializer
)


class IsDesignerOrArtisan(permissions.BasePermission):
    """Custom permission for commission access"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            # Allow read access to designer or artisan
            return (obj.designer == request.user or 
                    obj.artisan.user == request.user)
        
        # Write access based on action
        if hasattr(view, 'action'):
            if view.action in ['accept', 'reject', 'start_work']:
                return obj.artisan.user == request.user
            elif view.action == 'cancel':
                return obj.designer == request.user
        
        return False


class CommissionListView(generics.ListAPIView):
    """List commissions with filtering"""
    serializer_class = CommissionListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'artisan', 'designer']
    search_fields = ['title', 'custom_brief']
    ordering_fields = ['created_at', 'requested_delivery_date', 'budget_kes']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter commissions by user role"""
        user = self.request.user
        if user.role == 'DESIGNER':
            return Commission.objects.filter(designer=user).select_related(
                'designer', 'artisan__user'
            )
        elif user.role == 'ARTISAN':
            return Commission.objects.filter(artisan__user=user).select_related(
                'designer', 'artisan__user'
            )
        return Commission.objects.none()
    
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


class CommissionDetailView(generics.RetrieveAPIView):
    """Get commission details"""
    queryset = Commission.objects.select_related(
        'designer', 'artisan__user', 'reference_product'
    ).prefetch_related('milestones')
    serializer_class = CommissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsDesignerOrArtisan]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })


class CommissionCreateView(generics.CreateAPIView):
    """Create new commission"""
    queryset = Commission.objects.all()
    serializer_class = CommissionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Check if user is designer
        if request.user.role != 'DESIGNER':
            return Response({
                'success': False,
                'message': 'Only designers can create commissions'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        commission = serializer.save()
        
        return Response({
            'success': True,
            'data': CommissionSerializer(commission).data,
            'message': 'Commission created successfully'
        }, status=status.HTTP_201_CREATED)


class CommissionActionView(APIView):
    """Handle commission status actions"""
    permission_classes = [permissions.IsAuthenticated, IsDesignerOrArtisan]
    
    def post(self, request, pk):
        commission = get_object_or_404(
            Commission.objects.select_related('designer', 'artisan__user'),
            pk=pk
        )
        
        # Check permissions
        self.check_object_permissions(request, commission)
        
        serializer = CommissionStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        action = serializer.validated_data['action']
        
        try:
            if action == 'accept':
                if commission.status != Commission.CommissionStatus.PENDING:
                    return Response({
                        'success': False,
                        'message': 'Commission can only be accepted when pending'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if commission.artisan.user != request.user:
                    return Response({
                        'success': False,
                        'message': 'Only the artisan can accept this commission'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                agreed_date = serializer.validated_data['agreed_delivery_date']
                commission.accept(agreed_date)
                message = 'Commission accepted successfully'
            
            elif action == 'reject':
                if commission.status != Commission.CommissionStatus.PENDING:
                    return Response({
                        'success': False,
                        'message': 'Commission can only be rejected when pending'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if commission.artisan.user != request.user:
                    return Response({
                        'success': False,
                        'message': 'Only the artisan can reject this commission'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                commission.reject()
                message = 'Commission rejected'
            
            elif action == 'start_work':
                if commission.status != Commission.CommissionStatus.ACCEPTED:
                    return Response({
                        'success': False,
                        'message': 'Commission must be accepted before starting work'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if commission.artisan.user != request.user:
                    return Response({
                        'success': False,
                        'message': 'Only the artisan can start work on this commission'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                commission.start_work()
                message = 'Work started on commission'
            
            elif action == 'complete':
                if commission.status != Commission.CommissionStatus.IN_PROGRESS:
                    return Response({
                        'success': False,
                        'message': 'Commission must be in progress to complete'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if commission.artisan.user != request.user:
                    return Response({
                        'success': False,
                        'message': 'Only the artisan can complete this commission'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                commission.complete()
                message = 'Commission completed successfully'
            
            elif action == 'cancel':
                if commission.status == Commission.CommissionStatus.COMPLETED:
                    return Response({
                        'success': False,
                        'message': 'Cannot cancel completed commission'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if commission.designer != request.user:
                    return Response({
                        'success': False,
                        'message': 'Only the designer can cancel this commission'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                commission.status = Commission.CommissionStatus.CANCELLED
                commission.save()
                message = 'Commission cancelled'
            
            return Response({
                'success': True,
                'data': CommissionSerializer(commission).data,
                'message': message
            })
        
        except Exception as e:
            return Response({
                'success': False,
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class MilestoneListView(generics.ListAPIView):
    """List milestones for a commission"""
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        commission_id = self.kwargs['commission_id']
        return Milestone.objects.filter(commission_id=commission_id).order_by('order')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class MilestoneUpdateView(generics.UpdateAPIView):
    """Update milestone progress"""
    queryset = Milestone.objects.select_related('commission__artisan__user')
    serializer_class = MilestoneUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Only artisan can update milestones
        if instance.commission.artisan.user != request.user:
            return Response({
                'success': False,
                'message': 'Only the artisan can update milestone progress'
            }, status=status.HTTP_403_FORBIDDEN)
        
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': MilestoneSerializer(instance).data,
            'message': 'Milestone updated successfully'
        })


# Made with Bob