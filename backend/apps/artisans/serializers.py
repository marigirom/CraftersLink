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
    portfolio_images = serializers.SerializerMethodField()
    
    class Meta:
        model = ArtisanProfile
        fields = [
            'id', 'user_name', 'county', 'county_display', 'town',
            'craft_specialty', 'craft_specialty_display', 'years_of_experience',
            'average_rating', 'total_commissions', 'portfolio_images'
        ]
    
    def get_portfolio_images(self, obj):
        """Return absolute URLs for portfolio images"""
        request = self.context.get('request')
        if obj.portfolio_images and request:
            return [
                request.build_absolute_uri(img) if not img.startswith('http') else img
                for img in obj.portfolio_images
            ]
        return obj.portfolio_images or []


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    artisan_name = serializers.SerializerMethodField()
    artisan_id = serializers.IntegerField(source='artisan.id', read_only=True)
    artisan_location = serializers.SerializerMethodField()
    artisan_specialisation = serializers.SerializerMethodField()
    artisan_bio = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    dimensions = serializers.CharField(source='get_dimensions_display', read_only=True)
    primary_image = serializers.SerializerMethodField()
    additional_images = serializers.SerializerMethodField()
    availability_status = serializers.CharField(source='status', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'artisan', 'artisan_id', 'artisan_name', 'artisan_location',
            'artisan_specialisation', 'artisan_bio', 'name', 'description',
            'material', 'length_cm', 'width_cm', 'height_cm', 'weight_kg',
            'dimensions', 'price_kes', 'status', 'status_display', 'availability_status',
            'primary_image', 'additional_images', 'craft_category', 'tags',
            'views_count', 'commission_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'artisan', 'artisan_id', 'artisan_name', 'artisan_location',
            'artisan_specialisation', 'artisan_bio', 'views_count',
            'commission_count', 'created_at', 'updated_at'
        ]
    
    def get_artisan_name(self, obj):
        """Get artisan full name or business name"""
        if obj.artisan.business_name:
            return obj.artisan.business_name
        return obj.artisan.user.get_full_name()
    
    def get_artisan_location(self, obj):
        """Get artisan location"""
        location_parts = []
        if obj.artisan.town:
            location_parts.append(obj.artisan.town)
        if obj.artisan.county:
            location_parts.append(obj.artisan.get_county_display())
        return ', '.join(location_parts) if location_parts else ''
    
    def get_artisan_specialisation(self, obj):
        """Get artisan craft specialty"""
        return obj.artisan.get_craft_specialty_display()
    
    def get_artisan_bio(self, obj):
        """Get artisan bio"""
        return obj.artisan.bio
    
    def get_primary_image(self, obj):
        """Return absolute URL for primary image"""
        request = self.context.get('request')
        if obj.primary_image and request:
            if obj.primary_image.startswith('http'):
                return obj.primary_image
            return request.build_absolute_uri(obj.primary_image)
        return obj.primary_image
    
    def get_additional_images(self, obj):
        """Return absolute URLs for additional images"""
        request = self.context.get('request')
        if obj.additional_images and request:
            return [
                request.build_absolute_uri(img) if not img.startswith('http') else img
                for img in obj.additional_images
            ]
        return obj.additional_images or []
    
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
    # Override to accept file uploads
    primary_image = serializers.ImageField(required=True)
    # Don't use ListField for file uploads in FormData - handle in create() instead
    tags = serializers.JSONField(required=False)
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'material', 'length_cm', 'width_cm',
            'height_cm', 'weight_kg', 'price_kes', 'status', 'primary_image',
            'craft_category', 'tags'
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
    
    def create(self, validated_data):
        """Create product - artisan is set by view's perform_create"""
        request = self.context['request']
        
        # Handle file uploads
        primary_image = validated_data.pop('primary_image', None)
        tags = validated_data.pop('tags', [])
        
        # Get additional images from request.FILES
        additional_image_files = request.FILES.getlist('additional_images')
        
        # Save primary image
        if primary_image:
            validated_data['primary_image'] = self._save_image(primary_image)
        
        # Save additional images
        if additional_image_files:
            validated_data['additional_images'] = [
                self._save_image(img) for img in additional_image_files
            ]
        else:
            validated_data['additional_images'] = []
        
        # Handle tags - parse if it's a JSON string
        if isinstance(tags, str):
            import json
            try:
                tags = json.loads(tags)
            except json.JSONDecodeError:
                tags = []
        
        validated_data['tags'] = tags if tags else []
        
        return super().create(validated_data)
    
    def _save_image(self, image_file):
        """Save image file and return URL"""
        # For development: return a placeholder URL
        # In production: upload to cloud storage and return the URL
        from django.core.files.storage import default_storage
        from django.conf import settings
        import os
        
        # Save file to media directory
        file_name = f"products/{image_file.name}"
        path = default_storage.save(file_name, image_file)
        
        # Return the media URL
        return f"{settings.MEDIA_URL}{path}"


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product list"""
    artisan_name = serializers.CharField(source='artisan.user.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'artisan_name', 'name', 'material', 'price_kes',
            'status', 'status_display', 'primary_image', 'craft_category',
            'views_count', 'commission_count', 'created_at'
        ]
    
    def get_primary_image(self, obj):
        """Return absolute URL for primary image"""
        request = self.context.get('request')
        if obj.primary_image and request:
            if obj.primary_image.startswith('http'):
                return obj.primary_image
            return request.build_absolute_uri(obj.primary_image)
        return obj.primary_image


class CatalogueItemSerializer(serializers.ModelSerializer):
    """Serializer for catalogue items (products) with frontend-compatible field names"""
    artisan = serializers.SerializerMethodField()
    title = serializers.CharField(source='name', read_only=True)
    category = serializers.CharField(source='craft_category', read_only=True)
    price = serializers.DecimalField(source='price_kes', max_digits=10, decimal_places=2, read_only=True)
    images = serializers.SerializerMethodField()
    availability = serializers.CharField(source='status_display', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'category', 'price', 'images', 'availability',
            'artisan', 'description', 'material', 'dimensions', 'tags',
            'views_count', 'created_at'
        ]
    
    def get_artisan(self, obj):
        return {
            'id': obj.artisan.id,
            'user': {
                'full_name': obj.artisan.user.get_full_name()
            }
        }
    
    def get_images(self, obj):
        """Return all images as a list"""
        images = [obj.primary_image]
        if obj.additional_images:
            images.extend(obj.additional_images)
        return images


class ArtisanWithProductsSerializer(serializers.ModelSerializer):
    """Serializer for artisan with their products"""
    user = UserSerializer(read_only=True)
    county_display = serializers.CharField(source='get_county_display', read_only=True)
    craft_specialty_display = serializers.CharField(source='get_craft_specialty_display', read_only=True)
    products = ProductListSerializer(many=True, read_only=True)
    
    class Meta:
        model = ArtisanProfile
        fields = [
            'id', 'user', 'bio', 'county', 'county_display', 'town',
            'craft_specialty', 'craft_specialty_display', 'years_of_experience',
            'workshop_address', 'business_name', 'business_registration',
            'portfolio_images', 'average_rating', 'total_commissions',
            'created_at', 'updated_at', 'products'
        ]


# Made with Bob