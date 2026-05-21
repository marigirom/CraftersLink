from django.urls import path
from .views import (
    SavedItemListView,
    SavedItemDeleteView,
    GlobalSearchView,
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    ArtisanDashboardStatsView,
    DesignerDashboardStatsView,
    ProjectListCreateView,
    ProjectDetailView,
    ProjectItemListCreateView,
    ProjectItemDeleteView,
    HealthCheckView,
)

app_name = 'common'

urlpatterns = [
    # Health Check
    path('health/', HealthCheckView.as_view(), name='health-check'),
    
    # Dashboard Stats
    path('dashboard/artisan/stats/', ArtisanDashboardStatsView.as_view(), name='artisan-stats'),
    path('dashboard/designer/stats/', DesignerDashboardStatsView.as_view(), name='designer-stats'),
    
    # Saved Items
    path('saved/', SavedItemListView.as_view(), name='saved-list'),
    path('saved/<int:pk>/', SavedItemDeleteView.as_view(), name='saved-delete'),
    
    # Projects
    path('projects/', ProjectListCreateView.as_view(), name='project-list'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<int:project_id>/items/', ProjectItemListCreateView.as_view(), name='project-items'),
    path('projects/<int:project_id>/items/<int:item_id>/', ProjectItemDeleteView.as_view(), name='project-item-delete'),
    
    # Search
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    
    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification-read'),
    path('notifications/read-all/', NotificationMarkAllReadView.as_view(), name='notification-read-all'),
]

# Made with Bob