from django.urls import path
from .views import (
    CommissionListView,
    CommissionDetailView,
    CommissionCreateView,
    CommissionActionView,
    MilestoneListView,
    MilestoneUpdateView,
)

app_name = 'commissions'

urlpatterns = [
    # Commission endpoints
    path('', CommissionListView.as_view(), name='commission-list'),
    path('create/', CommissionCreateView.as_view(), name='commission-create'),
    path('<int:pk>/', CommissionDetailView.as_view(), name='commission-detail'),
    path('<int:pk>/action/', CommissionActionView.as_view(), name='commission-action'),
    
    # Milestone endpoints
    path('<int:commission_id>/milestones/', MilestoneListView.as_view(), name='milestone-list'),
    path('milestones/<int:pk>/', MilestoneUpdateView.as_view(), name='milestone-update'),
]

# Made with Bob