from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView,
    UserLoginView,
    CurrentUserView,
    DesignerProfileView,
    DesignerProfileDetailView,
)

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', CurrentUserView.as_view(), name='current_user'),
    
    # Designer Profile
    path('designer/profile/', DesignerProfileView.as_view(), name='designer_profile'),
    path('designer/<int:pk>/', DesignerProfileDetailView.as_view(), name='designer_detail'),
]

# Made with Bob