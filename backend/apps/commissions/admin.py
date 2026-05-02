from django.contrib import admin
from .models import Commission, Milestone


class MilestoneInline(admin.TabularInline):
    """Inline admin for Milestones"""
    model = Milestone
    extra = 0
    readonly_fields = ['actual_completion', 'created_at', 'updated_at']


@admin.register(Commission)
class CommissionAdmin(admin.ModelAdmin):
    """Admin configuration for Commission model"""
    list_display = ['title', 'designer', 'artisan', 'status', 'budget_kes', 'requested_delivery_date', 'created_at']
    list_filter = ['status', 'created_at', 'requested_delivery_date']
    search_fields = ['title', 'custom_brief', 'designer__email', 'artisan__user__email']
    ordering = ['-created_at']
    readonly_fields = ['agreed_delivery_date', 'actual_delivery_date', 'created_at', 'updated_at']
    inlines = [MilestoneInline]


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    """Admin configuration for Milestone model"""
    list_display = ['name', 'commission', 'status', 'progress_percentage', 'order', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'description', 'commission__title']
    ordering = ['commission', 'order']
    readonly_fields = ['actual_completion', 'created_at', 'updated_at']


# Made with Bob