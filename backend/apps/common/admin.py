from django.contrib import admin
from .models import SavedItem, Notification


@admin.register(SavedItem)
class SavedItemAdmin(admin.ModelAdmin):
    list_display = ['designer', 'product', 'saved_at']
    list_filter = ['saved_at']
    search_fields = ['designer__email', 'designer__first_name', 'designer__last_name', 'product__name']
    date_hierarchy = 'saved_at'


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'type', 'title', 'is_read', 'created_at']
    list_filter = ['type', 'is_read', 'created_at']
    search_fields = ['user__email', 'title', 'message']
    date_hierarchy = 'created_at'
    actions = ['mark_as_read']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Mark selected notifications as read"


# Made with Bob