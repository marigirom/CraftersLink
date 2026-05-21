from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, DesignerProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model"""
    list_display = ['email', 'username', 'role', 'is_verified', 'is_active', 'date_joined']
    list_filter = ['role', 'is_verified', 'is_active', 'is_staff']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone_number', 'profile_image')}),
        ('Role & Status', {'fields': ('role', 'is_verified', 'is_active')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('date_joined', 'last_login')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(DesignerProfile)
class DesignerProfileAdmin(admin.ModelAdmin):
    """Admin configuration for DesignerProfile model"""
    list_display = ['user', 'specialisation', 'years_of_experience', 'projects_completed', 'created_at']
    list_filter = ['specialisation', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'company_name', 'bio']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Profile Info', {'fields': ('company_name', 'specialisation', 'bio', 'years_of_experience')}),
        ('Portfolio', {'fields': ('portfolio_images',)}),
        ('Stats', {'fields': ('projects_completed',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


# Made with Bob