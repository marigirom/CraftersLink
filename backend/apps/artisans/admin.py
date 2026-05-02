from django.contrib import admin
from .models import ArtisanProfile, Product


@admin.register(ArtisanProfile)
class ArtisanProfileAdmin(admin.ModelAdmin):
    """Admin configuration for ArtisanProfile model"""
    list_display = ['user', 'county', 'craft_specialty', 'years_of_experience', 'average_rating', 'total_commissions']
    list_filter = ['county', 'craft_specialty', 'average_rating']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'business_name', 'bio']
    ordering = ['-average_rating', '-total_commissions']
    readonly_fields = ['average_rating', 'total_commissions', 'created_at', 'updated_at']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin configuration for Product model"""
    list_display = ['name', 'artisan', 'price_kes', 'status', 'craft_category', 'views_count', 'commission_count']
    list_filter = ['status', 'craft_category', 'material']
    search_fields = ['name', 'description', 'artisan__user__email', 'tags']
    ordering = ['-created_at']
    readonly_fields = ['views_count', 'commission_count', 'created_at', 'updated_at']


# Made with Bob