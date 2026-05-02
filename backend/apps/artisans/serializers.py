from rest_framework import serializers
from .models import ArtisanProfile, Product
from apps.users.serializers import UserSerializer


class ArtisanProfileSerializer(serializers.ModelSerializer):
    """Serializer for ArtisanProfile model"""
    user = UserSerializer(read_only=True)
    county_display = serializers.CharField(source='get_county_display', read_only=True)
    craft_specialty_display = serializers.CharField(source='get_craft_specialty_display', read_only=True)
    
    class Meta:
        model = ArtisanProfile
        fields = [
            'id', 'user', 'bio', 'county', 'county_display', 'town',
            'craft_specialty', 'craft_specialty_display', 'years_of_experience',
            'workshop_address', 'business_name', 'business_registration',
            'portfolio_images', 'average_rating', 'total_commissions',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'average_rating', 'total_commissions', 'created_at', 'updated_at']
    
    def validate_bio(self, value):
        """Validate bio length"""
        if len(value) < 50:
            raise serializers.ValidationError("Bio must be at least 50 characters long")
        return value
    
    def validate_portfolio_images(self, value):
        """Validate portfolio images count"""
        if len(value) > 10:
            raise serializers.ValidationError("Maximum 10 portfolio images allowed")
        return value


class ArtisanProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating ArtisanProfile"""
    
    class Meta:
        model = ArtisanProfile
        fields = [
            'bio', 'county', 'town', 'craft_specialty', 'years_of_experience',
            'workshop_address', 'business_name', 'business_registration',
            'portfolio_images'
        ]
    
    def validate_bio(self, value):
        """Validate bio length"""
        if len(value) < 50:
            raise serializers.ValidationError("Bio must be at least 50 characters long")
        return value
    
    def validate_portfolio_images(self, value):
        """Validate portfolio images count"""
        if len(value) > 10:
            raise serializers.ValidationError("Maximum 10 portfolio images allowed")
        return value
    
    def create(self, validated_data):
        """Create artisan profile with user from context"""
        user = self.context['request'].user
        if user.role != 'ARTISAN':
            raise serializers.ValidationError("Only artisan users can create artisan profiles")
        validated_data['user'] = user
        return super().create(validated_data)


class ArtisanListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for artisan list"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    county_display = serializers.CharField(source='get_county_display', read_only=True)
    craft_specialty_display = serializers.CharField(source='get_craft_specialty_display', read_only=True)
    
    class Meta:
        model = ArtisanProfile
        fields = [
            'id', 'user_name', 'county', 'county_display', 'town',
            'craft_specialty', 'craft_specialty_display', 'years_of_experience',
            'average_rating', 'total_commissions', 'portfolio_images'
        ]


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    artisan_name = serializers.CharField(source='artisan.user.get_full_name', read_only=True)
    artisan_id = serializers.IntegerField(source='artisan.id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    dimensions = serializers.CharField(source='get_dimensions_display', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'artisan', 'artisan_id', 'artisan_name', 'name', 'description',
            'material', 'length_cm', 'width_cm', 'height_cm', 'weight_kg',
            'dimensions', 'price_kes', 'status', 'status_display',
            'primary_image', 'additional_images', 'craft_category', 'tags',
            'views_count', 'commission_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'artisan', 'artisan_id', 'artisan_name', 'views_count',
            'commission_count', 'created_at', 'updated_at'
        ]
    
    def validate_description(self, value):
        """Validate description length"""
        if len(value) < 100:
            raise serializers.ValidationError("Description must be at least 100 characters long")
        return value
    
    def validate_price_kes(self, value):
        """Validate price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value
    
    def validate_additional_images(self, value):
        """Validate additional images count"""
        if len(value) > 5:
            raise serializers.ValidationError("Maximum 5 additional images allowed")
        return value


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating products"""
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'material', 'length_cm', 'width_cm',
            'height_cm', 'weight_kg', 'price_kes', 'status', 'primary_image',
            'additional_images', 'craft_category', 'tags'
        ]
    
    def validate_description(self, value):
        """Validate description length"""
        if len(value) < 100:
            raise serializers.ValidationError("Description must be at least 100 characters long")
        return value
    
    def validate_price_kes(self, value):
        """Validate price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value
    
    def validate_additional_images(self, value):
        """Validate additional images count"""
        if len(value) > 5:
            raise serializers.ValidationError("Maximum 5 additional images allowed")
        return value
    
    def create(self, validated_data):
        """Create product with artisan from context"""
        user = self.context['request'].user
        if user.role != 'ARTISAN':
            raise serializers.ValidationError("Only artisan users can create products")
        
        try:
            artisan_profile = user.artisan_profile
        except ArtisanProfile.DoesNotExist:
            raise serializers.ValidationError("Artisan profile not found. Please create your profile first.")
        
        validated_data['artisan'] = artisan_profile
        return super().create(validated_data)


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product list"""
    artisan_name = serializers.CharField(source='artisan.user.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'artisan_name', 'name', 'material', 'price_kes',
            'status', 'status_display', 'primary_image', 'craft_category',
            'views_count', 'commission_count', 'created_at'
        ]


# Made with Bob