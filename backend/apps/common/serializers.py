from rest_framework import serializers
from .models import SavedItem, Notification, Project, ProjectItem
from apps.artisans.serializers import ProductListSerializer


class SavedItemSerializer(serializers.ModelSerializer):
    """Serializer for SavedItem model with product details."""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = SavedItem
        fields = ['id', 'designer', 'product', 'product_id', 'saved_at']
        read_only_fields = ['id', 'designer', 'saved_at']
    
    def create(self, validated_data):
        """Create saved item with current user as designer."""
        validated_data['designer'] = self.context['request'].user
        return super().create(validated_data)


class SavedItemCreateSerializer(serializers.Serializer):
    """Simplified serializer for creating saved items."""
    product_id = serializers.IntegerField(required=True)
    
    def validate_product_id(self, value):
        """Validate that product exists."""
        from apps.artisans.models import Product
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("Product does not exist")
        return value


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'type', 'type_display', 'title', 'message',
            'is_read', 'reference_id', 'reference_type', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating notifications."""
    
    class Meta:
        model = Notification
        fields = ['type', 'title', 'message', 'reference_id', 'reference_type']
    
    def create(self, validated_data):
        """Create notification with user from context."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class ProjectItemSerializer(serializers.ModelSerializer):
    """Serializer for ProjectItem with product details."""
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = ProjectItem
        fields = ['id', 'project', 'product', 'pinned_at', 'notes']
        read_only_fields = ['id', 'pinned_at']


class ProjectSerializer(serializers.ModelSerializer):
    """Serializer for Project with items."""
    items = ProjectItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'designer', 'name', 'description', 'items', 'item_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'designer', 'created_at', 'updated_at']
    
    def get_item_count(self, obj):
        """Return the number of items in the project."""
        return obj.get_item_count()


class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating projects."""
    
    class Meta:
        model = Project
        fields = ['name', 'description']
    
    def create(self, validated_data):
        """Create project with current user as designer."""
        validated_data['designer'] = self.context['request'].user
        return super().create(validated_data)


class ProjectItemCreateSerializer(serializers.Serializer):
    """Serializer for adding items to projects."""
    product_id = serializers.IntegerField(required=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_product_id(self, value):
        """Validate that product exists."""
        from apps.artisans.models import Product
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("Product does not exist")
        return value


# Made with Bob