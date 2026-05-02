from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from apps.users.models import User
from apps.artisans.models import ArtisanProfile, Product


class Commission(models.Model):
    """Commission model for custom work requests."""
    
    class CommissionStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Artisan Acceptance'
        ACCEPTED = 'ACCEPTED', 'Accepted by Artisan'
        REJECTED = 'REJECTED', 'Rejected by Artisan'
        IN_PROGRESS = 'IN_PROGRESS', 'Work in Progress'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    designer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='commissions_requested')
    artisan = models.ForeignKey(ArtisanProfile, on_delete=models.CASCADE, related_name='commissions_received')
    reference_product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='inspired_commissions')
    title = models.CharField(max_length=200)
    custom_brief = models.TextField()
    budget_kes = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    requested_delivery_date = models.DateField()
    agreed_delivery_date = models.DateField(null=True, blank=True)
    actual_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=CommissionStatus.choices,
        default=CommissionStatus.PENDING
    )
    attachment_urls = models.JSONField(default=list)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'commissions'
        indexes = [
            models.Index(fields=['designer', 'status']),
            models.Index(fields=['artisan', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.designer.get_full_name()} to {self.artisan.user.get_full_name()}"
    
    def accept(self, agreed_date):
        """Artisan accepts commission."""
        self.status = self.CommissionStatus.ACCEPTED
        self.agreed_delivery_date = agreed_date
        self.save()
        # Signal will create milestones
    
    def reject(self):
        """Artisan rejects commission."""
        self.status = self.CommissionStatus.REJECTED
        self.save()
    
    def start_work(self):
        """Begin commission work."""
        self.status = self.CommissionStatus.IN_PROGRESS
        self.save()
    
    def complete(self):
        """Mark commission as completed."""
        self.status = self.CommissionStatus.COMPLETED
        self.actual_delivery_date = timezone.now().date()
        self.save()
        # Signal will generate invoice
        self.artisan.increment_commission_count()


class Milestone(models.Model):
    """Milestone model for tracking commission progress."""
    
    class MilestoneStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        SOURCING = 'SOURCING', 'Sourcing Materials'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        READY = 'READY', 'Ready for Pickup/Delivery'
        DELIVERED = 'DELIVERED', 'Delivered'
    
    commission = models.ForeignKey(Commission, on_delete=models.CASCADE, related_name='milestones')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=MilestoneStatus.choices,
        default=MilestoneStatus.PENDING
    )
    progress_percentage = models.PositiveIntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    progress_images = models.JSONField(default=list)
    expected_completion = models.DateField(null=True, blank=True)
    actual_completion = models.DateTimeField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'milestones'
        indexes = [
            models.Index(fields=['commission', 'status']),
        ]
        ordering = ['order']
    
    def __str__(self):
        return f"{self.name} - {self.commission.title}"
    
    def update_progress(self, percentage, images=None):
        """Update milestone progress."""
        self.progress_percentage = min(percentage, 100)
        if images:
            self.progress_images.extend(images)
        if percentage == 100:
            self.actual_completion = timezone.now()
        self.save()
    
    def mark_complete(self):
        """Mark milestone as complete."""
        self.progress_percentage = 100
        self.actual_completion = timezone.now()
        self.save()


# Default milestones to be created when commission is accepted
DEFAULT_MILESTONES = [
    {'name': 'Material Sourcing', 'status': 'SOURCING', 'order': 1},
    {'name': 'Work in Progress', 'status': 'PENDING', 'order': 2},
    {'name': 'Quality Check', 'status': 'PENDING', 'order': 3},
    {'name': 'Ready for Delivery', 'status': 'PENDING', 'order': 4},
    {'name': 'Delivered', 'status': 'PENDING', 'order': 5},
]

# Made with Bob
