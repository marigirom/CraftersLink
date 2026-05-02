# CraftersLink - Data Models Specification

## Overview
This document provides detailed specifications for all Django models in the CraftersLink platform, including field definitions, relationships, constraints, and business logic.

---

## 1. User Model

**Location:** [`apps/users/models.py`](../backend/apps/users/models.py)

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Auto-incrementing primary key |
| `username` | CharField(150) | Unique, Required | Unique username for login |
| `email` | EmailField | Unique, Required | User's email address |
| `password` | CharField(128) | Required | Hashed password (Django default) |
| `first_name` | CharField(150) | Optional | User's first name |
| `last_name` | CharField(150) | Optional | User's last name |
| `role` | CharField(10) | Choices, Default='DESIGNER' | User role: ARTISAN or DESIGNER |
| `phone_number` | CharField(15) | Optional | Kenyan phone format (+254...) |
| `profile_image` | URLField | Optional | IBM COS URL for profile picture |
| `is_verified` | BooleanField | Default=False | Email/phone verification status |
| `is_active` | BooleanField | Default=True | Account active status |
| `is_staff` | BooleanField | Default=False | Django admin access |
| `is_superuser` | BooleanField | Default=False | Django superuser status |
| `date_joined` | DateTimeField | Auto | Account creation timestamp |
| `created_at` | DateTimeField | Auto | Record creation timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

### Relationships
- **One-to-One:** [`ArtisanProfile`](#2-artisanprofile-model) (if role is ARTISAN)
- **One-to-Many:** [`Commission`](#4-commission-model) (as designer)

### Indexes
```python
indexes = [
    models.Index(fields=['role', 'is_verified']),
    models.Index(fields=['email']),
]
```

### Business Rules
1. Email must be unique across all users
2. Username must be unique across all users
3. Role cannot be changed after account creation
4. Artisan users must have an associated ArtisanProfile
5. Designer users cannot create products
6. Phone number should follow Kenyan format validation

### Methods
```python
def get_full_name(self):
    """Returns the user's full name"""
    return f"{self.first_name} {self.last_name}".strip()

def is_artisan(self):
    """Check if user is an artisan"""
    return self.role == self.UserRole.ARTISAN

def is_designer(self):
    """Check if user is a designer"""
    return self.role == self.UserRole.DESIGNER
```

---

## 2. ArtisanProfile Model

**Location:** [`apps/artisans/models.py`](../backend/apps/artisans/models.py)

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Auto-incrementing primary key |
| `user` | OneToOneField | FK to User, Required | Associated user account |
| `bio` | TextField(1000) | Required | Artisan's biography |
| `county` | CharField(50) | Choices, Required | Kenyan county location |
| `town` | CharField(100) | Required | Town/city within county |
| `craft_specialty` | CharField(50) | Choices, Required | Primary craft specialty |
| `years_of_experience` | PositiveIntegerField | Default=0 | Years in craft |
| `workshop_address` | TextField | Optional | Physical workshop location |
| `business_name` | CharField(200) | Optional | Registered business name |
| `business_registration` | CharField(100) | Optional | Business registration number |
| `portfolio_images` | JSONField | Default=[] | List of IBM COS image URLs |
| `average_rating` | DecimalField(3,2) | Default=0.00 | Average rating (0.00-5.00) |
| `total_commissions` | PositiveIntegerField | Default=0 | Completed commissions count |
| `created_at` | DateTimeField | Auto | Record creation timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

### County Choices (47 Kenyan Counties)
```python
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
    ('KISUMU', 'Kisumu'),
    ('HOMA_BAY', 'Homa Bay'),
    ('MIGORI', 'Migori'),
    ('NYAMIRA', 'Nyamira'),
]
```

### Craft Specialty Choices
```python
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
```

### Relationships
- **One-to-One:** [`User`](#1-user-model) (required)
- **One-to-Many:** [`Product`](#3-product-model)
- **One-to-Many:** [`Commission`](#4-commission-model) (received)

### Indexes
```python
indexes = [
    models.Index(fields=['county', 'craft_specialty']),
    models.Index(fields=['average_rating']),
]
```

### Business Rules
1. User must have role='ARTISAN' to create ArtisanProfile
2. Portfolio images limited to 10 images maximum
3. Average rating calculated from completed commissions
4. Total commissions auto-incremented on commission completion
5. Bio must be at least 50 characters

### Methods
```python
def update_rating(self):
    """Recalculate average rating from completed commissions"""
    from apps.commissions.models import Commission
    completed = Commission.objects.filter(
        artisan=self,
        status='COMPLETED'
    )
    if completed.exists():
        # Calculate from commission ratings (future feature)
        pass

def increment_commission_count(self):
    """Increment total commissions counter"""
    self.total_commissions += 1
    self.save(update_fields=['total_commissions'])
```

---

## 3. Product Model

**Location:** [`apps/artisans/models.py`](../backend/apps/artisans/models.py)

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Auto-incrementing primary key |
| `artisan` | ForeignKey | FK to ArtisanProfile, Required | Product owner |
| `name` | CharField(200) | Required | Product name |
| `description` | TextField | Required | Detailed description |
| `material` | CharField(100) | Required | Primary material used |
| `length_cm` | DecimalField(6,2) | Optional | Length in centimeters |
| `width_cm` | DecimalField(6,2) | Optional | Width in centimeters |
| `height_cm` | DecimalField(6,2) | Optional | Height in centimeters |
| `weight_kg` | DecimalField(6,2) | Optional | Weight in kilograms |
| `price_kes` | DecimalField(10,2) | Required | Price in Kenyan Shillings |
| `status` | CharField(20) | Choices, Default='COMMISSIONABLE' | Product availability status |
| `primary_image` | URLField | Required | Main product image (IBM COS) |
| `additional_images` | JSONField | Default=[] | Additional images (IBM COS URLs) |
| `craft_category` | CharField(50) | Required | Craft category |
| `tags` | JSONField | Default=[] | Search tags |
| `views_count` | PositiveIntegerField | Default=0 | Product view counter |
| `commission_count` | PositiveIntegerField | Default=0 | Times commissioned |
| `created_at` | DateTimeField | Auto | Record creation timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

### Status Choices
```python
class ProductStatus(models.TextChoices):
    IN_STOCK = 'IN_STOCK', 'In Stock'
    COMMISSIONABLE = 'COMMISSIONABLE', 'Available for Commission'
    SOLD = 'SOLD', 'Sold'
    ARCHIVED = 'ARCHIVED', 'Archived'
```

### Relationships
- **Many-to-One:** [`ArtisanProfile`](#2-artisanprofile-model) (required)
- **One-to-Many:** [`Commission`](#4-commission-model) (as reference)

### Indexes
```python
indexes = [
    models.Index(fields=['status', 'craft_category']),
    models.Index(fields=['material']),
    models.Index(fields=['price_kes']),
]
```

### Business Rules
1. Only artisan users can create products
2. Price must be positive (>0)
3. Additional images limited to 5 images
4. IN_STOCK products cannot be commissioned
5. SOLD products cannot be edited
6. Description must be at least 100 characters

### Methods
```python
def increment_views(self):
    """Increment view counter"""
    self.views_count += 1
    self.save(update_fields=['views_count'])

def mark_as_sold(self):
    """Mark product as sold"""
    self.status = self.ProductStatus.SOLD
    self.save(update_fields=['status'])

def get_dimensions_display(self):
    """Return formatted dimensions string"""
    if all([self.length_cm, self.width_cm, self.height_cm]):
        return f"{self.length_cm} × {self.width_cm} × {self.height_cm} cm"
    return "Dimensions not specified"
```

---

## 4. Commission Model

**Location:** [`apps/commissions/models.py`](../backend/apps/commissions/models.py)

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Auto-incrementing primary key |
| `designer` | ForeignKey | FK to User, Required | Commission requester |
| `artisan` | ForeignKey | FK to ArtisanProfile, Required | Commission recipient |
| `reference_product` | ForeignKey | FK to Product, Optional | Inspiration product |
| `title` | CharField(200) | Required | Commission title |
| `custom_brief` | TextField | Required | Detailed requirements |
| `budget_kes` | DecimalField(10,2) | Required | Budget in KES |
| `requested_delivery_date` | DateField | Required | Designer's requested date |
| `agreed_delivery_date` | DateField | Optional | Artisan's agreed date |
| `actual_delivery_date` | DateField | Optional | Actual delivery date |
| `status` | CharField(20) | Choices, Default='PENDING' | Commission status |
| `attachment_urls` | JSONField | Default=[] | Brief attachments (IBM COS) |
| `notes` | TextField | Optional | Additional notes |
| `created_at` | DateTimeField | Auto | Record creation timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

### Status Choices
```python
class CommissionStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Artisan Acceptance'
    ACCEPTED = 'ACCEPTED', 'Accepted by Artisan'
    REJECTED = 'REJECTED', 'Rejected by Artisan'
    IN_PROGRESS = 'IN_PROGRESS', 'Work in Progress'
    COMPLETED = 'COMPLETED', 'Completed'
    CANCELLED = 'CANCELLED', 'Cancelled'
```

### Relationships
- **Many-to-One:** [`User`](#1-user-model) (designer, required)
- **Many-to-One:** [`ArtisanProfile`](#2-artisanprofile-model) (required)
- **Many-to-One:** [`Product`](#3-product-model) (optional reference)
- **One-to-One:** [`Invoice`](#6-invoice-model)
- **One-to-Many:** [`Milestone`](#5-milestone-model)

### Indexes
```python
indexes = [
    models.Index(fields=['designer', 'status']),
    models.Index(fields=['artisan', 'status']),
    models.Index(fields=['status', 'created_at']),
]
```

### Business Rules
1. Designer must have role='DESIGNER'
2. Budget must be positive (>0)
3. Requested delivery date must be in future
4. Status transitions must follow workflow
5. Cannot cancel after IN_PROGRESS status
6. Auto-create milestones on ACCEPTED status

### Status Transition Rules
```
PENDING → ACCEPTED (artisan accepts)
PENDING → REJECTED (artisan rejects)
PENDING → CANCELLED (designer cancels)
ACCEPTED → IN_PROGRESS (work begins)
ACCEPTED → CANCELLED (designer cancels)
IN_PROGRESS → COMPLETED (all milestones done)
```

### Methods
```python
def accept(self, agreed_date):
    """Artisan accepts commission"""
    self.status = self.CommissionStatus.ACCEPTED
    self.agreed_delivery_date = agreed_date
    self.save()
    # Signal creates milestones

def reject(self):
    """Artisan rejects commission"""
    self.status = self.CommissionStatus.REJECTED
    self.save()

def start_work(self):
    """Begin commission work"""
    self.status = self.CommissionStatus.IN_PROGRESS
    self.save()

def complete(self):
    """Mark commission as completed"""
    self.status = self.CommissionStatus.COMPLETED
    self.actual_delivery_date = timezone.now().date()
    self.save()
    # Signal generates invoice
```

---

## 5. Milestone Model

**Location:** [`apps/commissions/models.py`](../backend/apps/commissions/models.py)

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Auto-incrementing primary key |
| `commission` | ForeignKey | FK to Commission, Required | Parent commission |
| `name` | CharField(100) | Required | Milestone name |
| `description` | TextField | Optional | Milestone description |
| `status` | CharField(20) | Choices, Default='PENDING' | Milestone status |
| `progress_percentage` | PositiveIntegerField | Default=0, Range 0-100 | Completion percentage |
| `progress_images` | JSONField | Default=[] | Progress photos (IBM COS) |
| `expected_completion` | DateField | Optional | Expected completion date |
| `actual_completion` | DateTimeField | Optional | Actual completion timestamp |
| `order` | PositiveIntegerField | Default=0 | Display order |
| `created_at` | DateTimeField | Auto | Record creation timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

### Status Choices
```python
class MilestoneStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    SOURCING = 'SOURCING', 'Sourcing Materials'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    READY = 'READY', 'Ready for Pickup/Delivery'
    DELIVERED = 'DELIVERED', 'Delivered'
```

### Default Milestones (Auto-created)
```python
DEFAULT_MILESTONES = [
    {'name': 'Material Sourcing', 'status': 'SOURCING', 'order': 1},
    {'name': 'Work in Progress', 'status': 'PENDING', 'order': 2},
    {'name': 'Quality Check', 'status': 'PENDING', 'order': 3},
    {'name': 'Ready for Delivery', 'status': 'PENDING', 'order': 4},
    {'name': 'Delivered', 'status': 'PENDING', 'order': 5},
]
```

### Relationships
- **Many-to-One:** [`Commission`](#4-commission-model) (required)

### Indexes
```python
indexes = [
    models.Index(fields=['commission', 'status']),
]
```

### Business Rules
1. Auto-created when commission is ACCEPTED
2. Progress percentage must be 0-100
3. Progress images limited to 5 per milestone
4. Status must progress sequentially
5. Actual completion auto-set when status changes to next

### Methods
```python
def update_progress(self, percentage, images=None):
    """Update milestone progress"""
    self.progress_percentage = min(percentage, 100)
    if images:
        self.progress_images.extend(images)
    if percentage == 100:
        self.actual_completion = timezone.now()
    self.save()

def mark_complete(self):
    """Mark milestone as complete"""
    self.progress_percentage = 100
    self.actual_completion = timezone.now()
    self.save()
```

---

## 6. Invoice Model

**Location:** [`apps/invoices/models.py`](../backend/apps/invoices/models.py)

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | AutoField | PK | Auto-incrementing primary key |
| `commission` | OneToOneField | FK to Commission, Required | Associated commission |
| `invoice_number` | CharField(50) | Unique, Required | Invoice number (INV-YYYY-NNN) |
| `issue_date` | DateField | Auto | Invoice issue date |
| `due_date` | DateField | Required | Payment due date |
| `subtotal_kes` | DecimalField(10,2) | Required | Subtotal before tax |
| `tax_percentage` | DecimalField(5,2) | Default=16.00 | VAT percentage |
| `tax_amount_kes` | DecimalField(10,2) | Required | Calculated tax amount |
| `total_kes` | DecimalField(10,2) | Required | Total amount due |
| `status` | CharField(20) | Choices, Default='DRAFT' | Invoice status |
| `line_items` | JSONField | Default=[] | Invoice line items |
| `payment_method` | CharField(50) | Optional | Payment method used |
| `payment_reference` | CharField(100) | Optional | Payment reference number |
| `paid_date` | DateTimeField | Optional | Payment received date |
| `pdf_url` | URLField | Optional | Generated PDF URL (IBM COS) |
| `notes` | TextField | Optional | Additional notes |
| `terms_and_conditions` | TextField | Optional | Payment terms |
| `created_at` | DateTimeField | Auto | Record creation timestamp |
| `updated_at` | DateTimeField | Auto | Last update timestamp |

### Status Choices
```python
class InvoiceStatus(models.TextChoices):
    DRAFT = 'DRAFT', 'Draft'
    SENT = 'SENT', 'Sent to Designer'
    PAID = 'PAID', 'Paid'
    OVERDUE = 'OVERDUE', 'Overdue'
    CANCELLED = 'CANCELLED', 'Cancelled'
```

### Line Item Structure
```python
{
    "description": "Custom soapstone elephant carving",
    "quantity": 1,
    "unit_price": 15000.00,
    "total": 15000.00
}
```

### Invoice Number Format
```
INV-YYYY-NNNN
Example: INV-2026-0001
```

### Relationships
- **One-to-One:** [`Commission`](#4-commission-model) (required)

### Indexes
```python
indexes = [
    models.Index(fields=['invoice_number']),
    models.Index(fields=['status', 'due_date']),
]
```

### Business Rules
1. Auto-generated when commission is COMPLETED
2. Invoice number auto-incremented per year
3. Due date defaults to 30 days from issue
4. VAT rate is 16% (Kenyan standard)
5. Cannot edit after status is SENT
6. Auto-mark OVERDUE if unpaid past due date

### Methods
```python
def generate_invoice_number(self):
    """Generate unique invoice number"""
    year = timezone.now().year
    last_invoice = Invoice.objects.filter(
        invoice_number__startswith=f'INV-{year}-'
    ).order_by('-invoice_number').first()
    
    if last_invoice:
        last_num = int(last_invoice.invoice_number.split('-')[-1])
        new_num = last_num + 1
    else:
        new_num = 1
    
    return f'INV-{year}-{new_num:04d}'

def calculate_totals(self):
    """Calculate tax and total from line items"""
    self.subtotal_kes = sum(item['total'] for item in self.line_items)
    self.tax_amount_kes = (self.subtotal_kes * self.tax_percentage) / 100
    self.total_kes = self.subtotal_kes + self.tax_amount_kes
    self.save()

def mark_as_paid(self, payment_method, reference):
    """Mark invoice as paid"""
    self.status = self.InvoiceStatus.PAID
    self.payment_method = payment_method
    self.payment_reference = reference
    self.paid_date = timezone.now()
    self.save()
```

---

## Database Constraints Summary

### Foreign Key Constraints
- All foreign keys use `CASCADE` delete for dependent data
- `SET_NULL` used for optional references (e.g., reference_product)

### Unique Constraints
- User: username, email
- Invoice: invoice_number
- ArtisanProfile: user (one-to-one)

### Check Constraints
```python
# Price validations
price_kes > 0
budget_kes > 0
subtotal_kes >= 0
total_kes >= 0

# Percentage validations
progress_percentage >= 0 AND progress_percentage <= 100
tax_percentage >= 0 AND tax_percentage <= 100
average_rating >= 0 AND average_rating <= 5
```

### Index Strategy
- Composite indexes on frequently queried field combinations
- Single indexes on foreign keys and status fields
- Covering indexes for common filter patterns

---

## Data Validation Rules

### Email Validation
- Must be valid email format
- Must be unique across all users
- Required for all users

### Phone Number Validation
- Kenyan format: +254XXXXXXXXX or 07XXXXXXXX
- Optional but recommended
- Validated using regex pattern

### Date Validation
- Delivery dates must be in future
- Due dates must be after issue dates
- Actual dates recorded on completion

### File Upload Validation
- Image types: JPEG, PNG, WebP
- Max file size: 5MB per image
- Max images per product: 5 additional + 1 primary
- Max portfolio images: 10

### Text Length Validation
- Bio: 50-1000 characters
- Description: 100-5000 characters
- Custom brief: 100-2000 characters
- Title: 10-200 characters

---

## Performance Considerations

### Query Optimization
1. Use `select_related()` for foreign key lookups
2. Use `prefetch_related()` for reverse foreign keys
3. Add database indexes on filtered fields
4. Use `only()` and `defer()` for large querysets

### Caching Strategy
1. Cache artisan profiles for 1 hour
2. Cache product catalogue for 15 minutes
3. Invalidate cache on model updates
4. Use Redis for session storage

### Pagination
- Default page size: 20 items
- Max page size: 100 items
- Cursor pagination for large datasets

---

This data model specification provides the foundation for implementing the CraftersLink database schema with Django ORM.