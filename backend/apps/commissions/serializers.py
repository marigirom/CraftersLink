from rest_framework import serializers
from django.utils import timezone
from .models import Commission, Milestone
from apps.users.serializers import UserSerializer
from apps.artisans.serializers import ArtisanListSerializer, ProductListSerializer


class MilestoneSerializer(serializers.ModelSerializer):
    """Serializer for Milestone model"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Milestone
        fields = [
            'id', 'commission', 'name', 'description', 'status', 'status_display',
            'progress_percentage', 'progress_images', 'expected_completion',
            'actual_completion', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'commission', 'created_at', 'updated_at']
    
    def validate_progress_percentage(self, value):
        """Validate progress percentage range"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Progress percentage must be between 0 and 100")
        return value
    
    def validate_progress_images(self, value):
        """Validate progress images count"""
        if len(value) > 5:
            raise serializers.ValidationError("Maximum 5 progress images allowed per milestone")
        return value


class MilestoneUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating milestone progress"""
    
    class Meta:
        model = Milestone
        fields = ['status', 'progress_percentage', 'progress_images']
    
    def validate_progress_percentage(self, value):
        """Validate progress percentage range"""
        if value < 0 or value > 100:
            raise serializers.ValidationError("Progress percentage must be between 0 and 100")
        return value
    
    def update(self, instance, validated_data):
        """Update milestone and set completion if 100%"""
        progress = validated_data.get('progress_percentage', instance.progress_percentage)
        
        if progress == 100 and not instance.actual_completion:
            validated_data['actual_completion'] = timezone.now()
        
        return super().update(instance, validated_data)


class CommissionSerializer(serializers.ModelSerializer):
    """Serializer for Commission model"""
    designer = UserSerializer(read_only=True)
    artisan = ArtisanListSerializer(read_only=True)
    reference_product = ProductListSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)
    
    class Meta:
        model = Commission
        fields = [
            'id', 'designer', 'artisan', 'reference_product', 'title',
            'custom_brief', 'budget_kes', 'requested_delivery_date',
            'agreed_delivery_date', 'actual_delivery_date', 'status',
            'status_display', 'attachment_urls', 'notes', 'milestones',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'designer', 'agreed_delivery_date', 'actual_delivery_date',
            'status', 'created_at', 'updated_at'
        ]


class CommissionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating commissions"""
    
    class Meta:
        model = Commission
        fields = [
            'artisan', 'reference_product', 'title', 'custom_brief',
            'budget_kes', 'requested_delivery_date', 'attachment_urls', 'notes'
        ]
    
    def validate_custom_brief(self, value):
        """Validate custom brief length"""
        if len(value) < 100:
            raise serializers.ValidationError("Custom brief must be at least 100 characters long")
        return value
    
    def validate_budget_kes(self, value):
        """Validate budget is positive"""
        if value <= 0:
            raise serializers.ValidationError("Budget must be greater than 0")
        return value
    
    def validate_requested_delivery_date(self, value):
        """Validate delivery date is in future"""
        if value <= timezone.now().date():
            raise serializers.ValidationError("Requested delivery date must be in the future")
        return value
    
    def create(self, validated_data):
        """Create commission with designer from context"""
        user = self.context['request'].user
        if user.role != 'DESIGNER':
            raise serializers.ValidationError("Only designer users can create commissions")
        
        validated_data['designer'] = user
        return super().create(validated_data)


class CommissionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for commission list"""
    designer_name = serializers.CharField(source='designer.get_full_name', read_only=True)
    artisan_name = serializers.CharField(source='artisan.user.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Commission
        fields = [
            'id', 'designer_name', 'artisan_name', 'title', 'budget_kes',
            'requested_delivery_date', 'status', 'status_display', 'created_at'
        ]


class CommissionAcceptSerializer(serializers.Serializer):
    """Serializer for accepting commission"""
    agreed_delivery_date = serializers.DateField(required=True)
    
    def validate_agreed_delivery_date(self, value):
        """Validate agreed delivery date is in future"""
        if value <= timezone.now().date():
            raise serializers.ValidationError("Agreed delivery date must be in the future")
        return value


class CommissionStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating commission status"""
    action = serializers.ChoiceField(
        choices=['accept', 'reject', 'start_work', 'complete', 'cancel'],
        required=True
    )
    agreed_delivery_date = serializers.DateField(required=False)
    
    def validate(self, attrs):
        """Validate action-specific requirements"""
        action = attrs.get('action')
        
        if action == 'accept' and 'agreed_delivery_date' not in attrs:
            raise serializers.ValidationError({
                "agreed_delivery_date": "Agreed delivery date is required when accepting commission"
            })
        
        if action == 'accept' and attrs.get('agreed_delivery_date'):
            if attrs['agreed_delivery_date'] <= timezone.now().date():
                raise serializers.ValidationError({
                    "agreed_delivery_date": "Agreed delivery date must be in the future"
                })
        
        return attrs


# Made with Bob