from rest_framework import permissions


class IsArtisan(permissions.BasePermission):
    """
    Permission class to allow only artisans to access a view.
    """
    message = "Only artisans can perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'ARTISAN'
        )


class IsDesigner(permissions.BasePermission):
    """
    Permission class to allow only interior designers to access a view.
    """
    message = "Only interior designers can perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['DESIGNER', 'INTERIOR_DESIGNER']
        )


class IsOwner(permissions.BasePermission):
    """
    Permission class to allow only the owner of an object to edit it.
    Works with objects that have 'user', 'artisan', or 'designer' attributes.
    """
    message = "You can only edit your own content."
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'artisan'):
            return obj.artisan.user == request.user
        elif hasattr(obj, 'designer'):
            return obj.designer == request.user
        
        return False


class IsArtisanOwner(permissions.BasePermission):
    """
    Permission class specifically for artisan-owned content.
    Combines IsArtisan check with ownership verification.
    """
    message = "Only the artisan owner can perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'ARTISAN'
        )
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if hasattr(obj, 'artisan'):
            return obj.artisan.user == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsDesignerOwner(permissions.BasePermission):
    """
    Permission class specifically for designer-owned content.
    Combines IsDesigner check with ownership verification.
    """
    message = "Only the designer owner can perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['DESIGNER', 'INTERIOR_DESIGNER']
        )
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if hasattr(obj, 'designer'):
            return obj.designer == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


# Made with Bob