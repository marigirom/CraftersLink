from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Invoice
from apps.commissions.serializers import CommissionListSerializer


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice model"""
    commission = CommissionListSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'commission', 'invoice_number', 'issue_date', 'due_date',
            'subtotal_kes', 'tax_percentage', 'tax_amount_kes', 'total_kes',
            'status', 'status_display', 'line_items', 'payment_method',
            'payment_reference', 'paid_date', 'pdf_url', 'notes',
            'terms_and_conditions', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'invoice_number', 'issue_date', 'tax_amount_kes',
            'total_kes', 'paid_date', 'created_at', 'updated_at'
        ]


class InvoiceListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for invoice list"""
    commission_title = serializers.CharField(source='commission.title', read_only=True)
    designer_name = serializers.CharField(source='commission.designer.get_full_name', read_only=True)
    artisan_name = serializers.CharField(source='commission.artisan.user.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'commission_title', 'designer_name',
            'artisan_name', 'issue_date', 'due_date', 'total_kes',
            'status', 'status_display', 'created_at'
        ]


class InvoiceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating invoices"""
    
    class Meta:
        model = Invoice
        fields = [
            'commission', 'due_date', 'subtotal_kes', 'tax_percentage',
            'line_items', 'notes', 'terms_and_conditions'
        ]
    
    def validate_line_items(self, value):
        """Validate line items structure"""
        if not value or len(value) == 0:
            raise serializers.ValidationError("At least one line item is required")
        
        for item in value:
            if not all(k in item for k in ['description', 'quantity', 'unit_price', 'total']):
                raise serializers.ValidationError(
                    "Each line item must have description, quantity, unit_price, and total"
                )
            if item['quantity'] <= 0:
                raise serializers.ValidationError("Quantity must be greater than 0")
            if item['unit_price'] <= 0:
                raise serializers.ValidationError("Unit price must be greater than 0")
        
        return value
    
    def create(self, validated_data):
        """Create invoice with auto-generated invoice number"""
        invoice = Invoice(**validated_data)
        invoice.invoice_number = invoice.generate_invoice_number()
        invoice.save()
        invoice.calculate_totals()
        return invoice


class InvoiceUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating invoice"""
    
    class Meta:
        model = Invoice
        fields = ['due_date', 'line_items', 'notes', 'terms_and_conditions']
    
    def validate(self, attrs):
        """Prevent editing sent invoices"""
        if self.instance.status != Invoice.InvoiceStatus.DRAFT:
            raise serializers.ValidationError("Cannot edit invoice after it has been sent")
        return attrs
    
    def update(self, instance, validated_data):
        """Update invoice and recalculate totals"""
        instance = super().update(instance, validated_data)
        if 'line_items' in validated_data:
            instance.calculate_totals()
        return instance


class InvoicePaymentSerializer(serializers.Serializer):
    """Serializer for marking invoice as paid"""
    payment_method = serializers.CharField(max_length=50, required=True)
    payment_reference = serializers.CharField(max_length=100, required=True)
    
    def validate_payment_method(self, value):
        """Validate payment method"""
        valid_methods = ['M-PESA', 'Bank Transfer', 'Cash', 'Cheque', 'Card']
        if value not in valid_methods:
            raise serializers.ValidationError(
                f"Payment method must be one of: {', '.join(valid_methods)}"
            )
        return value


# Made with Bob