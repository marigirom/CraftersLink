from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from io import BytesIO
from .models import Invoice
from .serializers import (
    InvoiceSerializer,
    InvoiceListSerializer,
    InvoiceCreateSerializer,
    InvoiceUpdateSerializer,
    InvoicePaymentSerializer
)
from .pdf_generator import generate_invoice_pdf
from apps.common.services.storage_service import storage_service


class IsInvoiceParticipant(permissions.BasePermission):
    """Custom permission for invoice access"""
    
    def has_object_permission(self, request, view, obj):
        # Allow access to designer or artisan
        return (obj.commission.designer == request.user or 
                obj.commission.artisan.user == request.user)


class InvoiceListView(generics.ListAPIView):
    """List invoices with filtering"""
    serializer_class = InvoiceListSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['invoice_number', 'commission__title']
    ordering_fields = ['issue_date', 'due_date', 'total_kes', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter invoices by user role"""
        user = self.request.user
        if user.role == 'DESIGNER':
            return Invoice.objects.filter(
                commission__designer=user
            ).select_related('commission__designer', 'commission__artisan__user')
        elif user.role == 'ARTISAN':
            return Invoice.objects.filter(
                commission__artisan__user=user
            ).select_related('commission__designer', 'commission__artisan__user')
        return Invoice.objects.none()
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'success': True,
                'data': serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class InvoiceDetailView(generics.RetrieveAPIView):
    """Get invoice details"""
    queryset = Invoice.objects.select_related(
        'commission__designer',
        'commission__artisan__user',
        'commission__reference_product'
    )
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated, IsInvoiceParticipant]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })


class InvoiceCreateView(generics.CreateAPIView):
    """Create new invoice (artisan only)"""
    queryset = Invoice.objects.all()
    serializer_class = InvoiceCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Only artisans can create invoices
        if request.user.role != 'ARTISAN':
            return Response({
                'success': False,
                'message': 'Only artisans can create invoices'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invoice = serializer.save()
        
        return Response({
            'success': True,
            'data': InvoiceSerializer(invoice).data,
            'message': 'Invoice created successfully'
        }, status=status.HTTP_201_CREATED)


class InvoiceUpdateView(generics.UpdateAPIView):
    """Update invoice (artisan only, draft only)"""
    queryset = Invoice.objects.all()
    serializer_class = InvoiceUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsInvoiceParticipant]
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Only artisan can update
        if instance.commission.artisan.user != request.user:
            return Response({
                'success': False,
                'message': 'Only the artisan can update this invoice'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Only draft invoices can be updated
        if instance.status != Invoice.InvoiceStatus.DRAFT:
            return Response({
                'success': False,
                'message': 'Only draft invoices can be updated'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': InvoiceSerializer(instance).data,
            'message': 'Invoice updated successfully'
        })


class InvoiceSendView(APIView):
    """Send invoice to designer"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        invoice = get_object_or_404(
            Invoice.objects.select_related('commission__artisan__user'),
            pk=pk
        )
        
        # Only artisan can send
        if invoice.commission.artisan.user != request.user:
            return Response({
                'success': False,
                'message': 'Only the artisan can send this invoice'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Only draft invoices can be sent
        if invoice.status != Invoice.InvoiceStatus.DRAFT:
            return Response({
                'success': False,
                'message': 'Only draft invoices can be sent'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        invoice.send_to_designer()
        
        return Response({
            'success': True,
            'data': InvoiceSerializer(invoice).data,
            'message': 'Invoice sent successfully'
        })


class InvoicePaymentView(APIView):
    """Mark invoice as paid"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        invoice = get_object_or_404(
            Invoice.objects.select_related('commission__designer'),
            pk=pk
        )
        
        # Only designer can mark as paid
        if invoice.commission.designer != request.user:
            return Response({
                'success': False,
                'message': 'Only the designer can mark this invoice as paid'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Only sent invoices can be paid
        if invoice.status not in [Invoice.InvoiceStatus.SENT, Invoice.InvoiceStatus.OVERDUE]:
            return Response({
                'success': False,
                'message': 'Invoice must be sent before it can be marked as paid'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = InvoicePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        invoice.mark_as_paid(
            payment_method=serializer.validated_data['payment_method'],
            reference=serializer.validated_data['payment_reference']
        )
        
        return Response({
            'success': True,
            'data': InvoiceSerializer(invoice).data,
            'message': 'Invoice marked as paid successfully'
        })


class InvoiceDownloadPDFView(APIView):
    """Download invoice as PDF"""
    permission_classes = [permissions.IsAuthenticated, IsInvoiceParticipant]
    
    def get(self, request, pk):
        invoice = get_object_or_404(
            Invoice.objects.select_related(
                'commission__designer',
                'commission__artisan__user'
            ),
            pk=pk
        )
        
        # Check permissions
        if not (invoice.commission.designer == request.user or 
                invoice.commission.artisan.user == request.user):
            return Response({
                'success': False,
                'message': 'You do not have permission to download this invoice'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Generate PDF
            pdf_content = generate_invoice_pdf(invoice)
            
            # Create response
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="invoice_{invoice.invoice_number}.pdf"'
            
            # Optionally upload to IBM COS and save URL
            if not invoice.pdf_url:
                try:
                    pdf_buffer = BytesIO(pdf_content)
                    pdf_url = storage_service.upload_pdf(
                        pdf_buffer,
                        'invoices',
                        f'invoice_{invoice.invoice_number}.pdf'
                    )
                    invoice.pdf_url = pdf_url
                    invoice.save(update_fields=['pdf_url'])
                except Exception as e:
                    # Continue even if upload fails
                    pass
            
            return response
        
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to generate PDF: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Made with Bob