from django.contrib import admin
from .models import Invoice


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    """Admin configuration for Invoice model"""
    list_display = ['invoice_number', 'commission', 'status', 'total_kes', 'issue_date', 'due_date', 'paid_date']
    list_filter = ['status', 'issue_date', 'due_date']
    search_fields = ['invoice_number', 'commission__title', 'commission__designer__email']
    ordering = ['-created_at']
    readonly_fields = ['invoice_number', 'issue_date', 'tax_amount_kes', 'total_kes', 'paid_date', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Invoice Information', {
            'fields': ('invoice_number', 'commission', 'status', 'issue_date', 'due_date')
        }),
        ('Financial Details', {
            'fields': ('subtotal_kes', 'tax_percentage', 'tax_amount_kes', 'total_kes', 'line_items')
        }),
        ('Payment Information', {
            'fields': ('payment_method', 'payment_reference', 'paid_date')
        }),
        ('Additional Information', {
            'fields': ('pdf_url', 'notes', 'terms_and_conditions')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


# Made with Bob