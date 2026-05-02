from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from apps.commissions.models import Commission


class Invoice(models.Model):
    """Invoice model for commission payments."""
    
    class InvoiceStatus(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        SENT = 'SENT', 'Sent to Designer'
        PAID = 'PAID', 'Paid'
        OVERDUE = 'OVERDUE', 'Overdue'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    commission = models.OneToOneField(Commission, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=50, unique=True)
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    subtotal_kes = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    tax_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=16.00,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    tax_amount_kes = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    total_kes = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    status = models.CharField(
        max_length=20,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.DRAFT
    )
    line_items = models.JSONField(default=list)
    payment_method = models.CharField(max_length=50, blank=True)
    payment_reference = models.CharField(max_length=100, blank=True)
    paid_date = models.DateTimeField(null=True, blank=True)
    pdf_url = models.URLField(blank=True)
    notes = models.TextField(blank=True)
    terms_and_conditions = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'invoices'
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['status', 'due_date']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.invoice_number} - {self.commission.title}"
    
    def generate_invoice_number(self):
        """Generate unique invoice number in format INV-YYYY-NNNN."""
        year = timezone.now().year
        last_invoice = Invoice.objects.filter(
            invoice_number__startswith=f'INV-{year}-'
        ).order_by('-invoice_number').first()
        
        if last_invoice:
            last_num = int(last_invoice.invoice_number.split('-')[-1])
            new_num = last_num + 1
        else:
            new_num = 1
        
        return f'INV-{year}-{new_num:04d}'
    
    def calculate_totals(self):
        """Calculate tax and total from line items."""
        self.subtotal_kes = sum(item['total'] for item in self.line_items)
        self.tax_amount_kes = (self.subtotal_kes * self.tax_percentage) / 100
        self.total_kes = self.subtotal_kes + self.tax_amount_kes
        self.save()
    
    def mark_as_paid(self, payment_method, reference):
        """Mark invoice as paid."""
        self.status = self.InvoiceStatus.PAID
        self.payment_method = payment_method
        self.payment_reference = reference
        self.paid_date = timezone.now()
        self.save()
    
    def send_to_designer(self):
        """Mark invoice as sent."""
        self.status = self.InvoiceStatus.SENT
        self.save()
    
    def check_overdue(self):
        """Check if invoice is overdue."""
        if self.status == self.InvoiceStatus.SENT and self.due_date < timezone.now().date():
            self.status = self.InvoiceStatus.OVERDUE
            self.save()

# Made with Bob
