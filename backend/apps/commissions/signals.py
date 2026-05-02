from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Commission, Milestone, DEFAULT_MILESTONES


@receiver(post_save, sender=Commission)
def create_milestones_on_accept(sender, instance, created, **kwargs):
    """
    Create default milestones when commission is accepted.
    Also trigger invoice generation when commission is completed.
    """
    if not created:
        # Check if status changed to ACCEPTED
        if instance.status == Commission.CommissionStatus.ACCEPTED:
            # Check if milestones already exist
            if not instance.milestones.exists():
                # Create default milestones
                for milestone_data in DEFAULT_MILESTONES:
                    Milestone.objects.create(
                        commission=instance,
                        name=milestone_data['name'],
                        status=milestone_data['status'],
                        order=milestone_data['order']
                    )
        
        # Check if status changed to COMPLETED
        elif instance.status == Commission.CommissionStatus.COMPLETED:
            # Check if invoice already exists
            if not hasattr(instance, 'invoice'):
                # Import here to avoid circular import
                from apps.invoices.models import Invoice
                from django.utils import timezone
                from datetime import timedelta
                
                # Create invoice
                invoice = Invoice.objects.create(
                    commission=instance,
                    invoice_number=Invoice().generate_invoice_number(),
                    due_date=timezone.now().date() + timedelta(days=30),
                    subtotal_kes=instance.budget_kes,
                    tax_percentage=16.00,  # Kenya VAT rate
                    line_items=[{
                        'description': instance.title,
                        'quantity': 1,
                        'unit_price': float(instance.budget_kes),
                        'total': float(instance.budget_kes)
                    }]
                )
                invoice.calculate_totals()


# Made with Bob