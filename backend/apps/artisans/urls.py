from django.urls import path
from .views import (
    ArtisanProfileListView,
    ArtisanProfileDetailView,
    ArtisanProfileCreateView,
    ArtisanProfileMeView,
    ProductListView,
    ProductDetailView,
    ProductCreateView,
    CatalogueListView,
    CatalogueItemDetailView,
    ArtisanCatalogueView,
    ArtisanRecentProductsView,
    DesignerRecentActivityView,
)

app_name = 'artisans'

urlpatterns = [
    # Artisan Profile endpoints
    path('', ArtisanProfileListView.as_view(), name='artisan-list'),
    path('create/', ArtisanProfileCreateView.as_view(), name='artisan-create'),
    path('profile/me/', ArtisanProfileMeView.as_view(), name='artisan-profile-me'),
    path('profile/me/recent-products/', ArtisanRecentProductsView.as_view(), name='artisan-recent-products'),
    
    # Product endpoints (static routes first)
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/create/', ProductCreateView.as_view(), name='product-create'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    
    # Catalogue endpoints (for designer browsing)
    path('catalogue/', CatalogueListView.as_view(), name='catalogue-list'),
    path('catalogue/<int:artisan_id>/<int:item_id>/', CatalogueItemDetailView.as_view(), name='catalogue-item-detail'),
    path('catalogue/<int:pk>/', ArtisanCatalogueView.as_view(), name='artisan-catalogue'),
    
    # Designer activity
    path('designer/recent-activity/', DesignerRecentActivityView.as_view(), name='designer-recent-activity'),

    # Artisan detail (dynamic route last)
    path('<int:pk>/', ArtisanProfileDetailView.as_view(), name='artisan-detail'),
]

# Made with Bob