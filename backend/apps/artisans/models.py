from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User


class ArtisanProfile(models.Model):
    """Artisan profile model with Kenyan-specific craft specialties."""
    
    COUNTY_CHOICES = [
        ('NAIROBI', 'Nairobi'),
        ('MOMBASA', 'Mombasa'),
        ('KISUMU', 'Kisumu'),
        ('NAKURU', 'Nakuru'),
        ('KIAMBU', 'Kiambu'),
        ('KISII', 'Kisii'),
        ('LAMU', 'Lamu'),
        ('KAJIADO', 'Kajiado'),
        ('MACHAKOS', 'Machakos'),
        ('KILIFI', 'Kilifi'),
        ('KWALE', 'Kwale'),
        ('TAITA_TAVETA', 'Taita Taveta'),
        ('GARISSA', 'Garissa'),
        ('WAJIR', 'Wajir'),
        ('MANDERA', 'Mandera'),
        ('MARSABIT', 'Marsabit'),
        ('ISIOLO', 'Isiolo'),
        ('MERU', 'Meru'),
        ('THARAKA_NITHI', 'Tharaka Nithi'),
        ('EMBU', 'Embu'),
        ('KITUI', 'Kitui'),
        ('MAKUENI', 'Makueni'),
        ('NYANDARUA', 'Nyandarua'),
        ('NYERI', 'Nyeri'),
        ('KIRINYAGA', 'Kirinyaga'),
        ('MURANGA', 'Murang\'a'),
        ('TURKANA', 'Turkana'),
        ('WEST_POKOT', 'West Pokot'),
        ('SAMBURU', 'Samburu'),
        ('TRANS_NZOIA', 'Trans Nzoia'),
        ('UASIN_GISHU', 'Uasin Gishu'),
        ('ELGEYO_MARAKWET', 'Elgeyo Marakwet'),
        ('NANDI', 'Nandi'),
        ('BARINGO', 'Baringo'),
        ('LAIKIPIA', 'Laikipia'),
        ('NAROK', 'Narok'),
        ('KERICHO', 'Kericho'),
        ('BOMET', 'Bomet'),
        ('KAKAMEGA', 'Kakamega'),
        ('VIHIGA', 'Vihiga'),
        ('BUNGOMA', 'Bungoma'),
        ('BUSIA', 'Busia'),
        ('SIAYA', 'Siaya'),
        ('HOMA_BAY', 'Homa Bay'),
        ('MIGORI', 'Migori'),
        ('NYAMIRA', 'Nyamira'),
    ]
    
    CRAFT_SPECIALTIES = [
        ('SOAPSTONE', 'Kisii Soapstone Carving'),
        ('FURNITURE', 'Lamu Furniture'),
        ('BEADWORK', 'Maasai Beadwork'),
        ('BASKETS', 'Woven Baskets'),
        ('POTTERY', 'Pottery & Ceramics'),
        ('TEXTILES', 'Traditional Textiles'),
        ('WOODCARVING', 'Wood Carving'),
        ('METALWORK', 'Metal Crafts'),
        ('JEWELRY', 'Handmade Jewelry'),
        ('LEATHER', 'Leather Crafts'),
        ('PAINTING', 'Traditional Painting'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='artisan_profile')
    bio = models.TextField(max_length=1000)
    county = models.CharField(max_length=50, choices=COUNTY_CHOICES)
    town = models.CharField(max_length=100)
    craft_specialty = models.CharField(max_length=50, choices=CRAFT_SPECIALTIES)
    years_of_experience = models.PositiveIntegerField(default=0)
    workshop_address = models.TextField(blank=True)
    business_name = models.CharField(max_length=200, blank=True)
    business_registration = models.CharField(max_length=100, blank=True)
    portfolio_images = models.JSONField(default=list)
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)]
    )
    total_commissions = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'artisan_profiles'
        indexes = [
            models.Index(fields=['county', 'craft_specialty']),
            models.Index(fields=['average_rating']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_craft_specialty_display()}"
    
    def update_rating(self):
        """Recalculate average rating from completed commissions."""
        from apps.commissions.models import Commission
        completed = Commission.objects.filter(
            artisan=self,
            status='COMPLETED'
        )
        if completed.exists():
            # Future: Calculate from commission ratings
            pass
    
    def increment_commission_count(self):
        """Increment total commissions counter."""
        self.total_commissions += 1
        self.save(update_fields=['total_commissions'])


class Product(models.Model):
    """Product model for artisan portfolio items."""
    
    class ProductStatus(models.TextChoices):
        IN_STOCK = 'IN_STOCK', 'In Stock'
        COMMISSIONABLE = 'COMMISSIONABLE', 'Available for Commission'
        SOLD = 'SOLD', 'Sold'
        ARCHIVED = 'ARCHIVED', 'Archived'
    
    artisan = models.ForeignKey(ArtisanProfile, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    description = models.TextField()
    material = models.CharField(max_length=100)
    length_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    width_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    height_cm = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    price_kes = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    status = models.CharField(
        max_length=20,
        choices=ProductStatus.choices,
        default=ProductStatus.COMMISSIONABLE
    )
    primary_image = models.URLField()
    additional_images = models.JSONField(default=list)
    craft_category = models.CharField(max_length=50)
    tags = models.JSONField(default=list)
    views_count = models.PositiveIntegerField(default=0)
    commission_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        indexes = [
            models.Index(fields=['status', 'craft_category']),
            models.Index(fields=['material']),
            models.Index(fields=['price_kes']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} by {self.artisan.user.get_full_name()}"
    
    def increment_views(self):
        """Increment view counter."""
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    def mark_as_sold(self):
        """Mark product as sold."""
        self.status = self.ProductStatus.SOLD
        self.save(update_fields=['status'])
    
    def get_dimensions_display(self):
        """Return formatted dimensions string."""
        if all([self.length_cm, self.width_cm, self.height_cm]):
            return f"{self.length_cm} × {self.width_cm} × {self.height_cm} cm"
        return "Dimensions not specified"

# Made with Bob
