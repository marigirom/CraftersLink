from django.db import models
from apps.users.models import User
from apps.artisans.models import Product


class SavedItem(models.Model):
    """Saved/favorited products by designers."""
    
    designer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='saved_items',
        limit_choices_to={'role': 'INTERIOR_DESIGNER'}
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'saved_items'
        unique_together = ['designer', 'product']
        ordering = ['-saved_at']
        indexes = [
            models.Index(fields=['designer', 'saved_at']),
        ]
    
    def __str__(self):
        return f"{self.designer.get_full_name()} saved {self.product.name}"


class Project(models.Model):
    """Project boards for designers to organize sourcing."""
    
    designer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='projects',
        limit_choices_to={'role': 'INTERIOR_DESIGNER'}
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['designer', '-updated_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.designer.get_full_name()}"
    
    def get_item_count(self):
        """Return the number of items pinned to this project."""
        return self.items.count()


class ProjectItem(models.Model):
    """Items pinned to designer project boards."""
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='pinned_to_projects')
    pinned_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'project_items'
        unique_together = ['project', 'product']
        ordering = ['-pinned_at']
        indexes = [
            models.Index(fields=['project', '-pinned_at']),
        ]
    
    def __str__(self):
        return f"{self.product.name} in {self.project.name}"


class Notification(models.Model):
    """User notifications."""
    
    TYPE_CHOICES = [
        ('NEW_ORDER', 'New Order'),
        ('ORDER_UPDATE', 'Order Update'),
        ('ORDER_COMPLETED', 'Order Completed'),
        ('MESSAGE', 'New Message'),
        ('PAYMENT', 'Payment Received'),
        ('REVIEW', 'New Review'),
        ('SYSTEM', 'System Notification'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    reference_id = models.CharField(max_length=100, blank=True)
    reference_type = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.user.email}"
    
    def mark_as_read(self):
        """Mark notification as read."""
        self.is_read = True
        self.save(update_fields=['is_read'])


# Made with Bob