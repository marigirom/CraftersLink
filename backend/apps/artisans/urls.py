from django.urls import path
from .views import (
    ArtisanProfileListView,
    ArtisanProfileDetailView,
    ArtisanProfileCreateView,
    ProductListView,
    ProductDetailView,
    ProductCreateView,
)

app_name = 'artisans'

urlpatterns = [
    # Artisan Profile endpoints
    path('', ArtisanProfileListView.as_view(), name='artisan-list'),
    path('create/', ArtisanProfileCreateView.as_view(), name='artisan-create'),
    path('<int:pk>/', ArtisanProfileDetailView.as_view(), name='artisan-detail'),
    
    # Product endpoints
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/create/', ProductCreateView.as_view(), name='product-create'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
]

# Made with Bob