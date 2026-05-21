# PostgreSQL Not Running - Quick Fix

## The Problem

Your PostgreSQL database container is not running. This means:
- Backend can't connect to database
- All API calls fail
- No data can be retrieved
- This causes the 404 errors and infinite loops

## Solution: Start All Services

### Step 1: Check Current Status

```bash
docker-compose ps
```

You'll probably see postgres is "exited" or not listed.

### Step 2: Start All Services

```bash
# Stop everything first
docker-compose down

# Start everything fresh
docker-compose up -d

# Check status
docker-compose ps
```

**Expected output:**
```
NAME                COMMAND                  SERVICE             STATUS              PORTS
crafterslink-backend    "python manage.py ru…"   backend             running             0.0.0.0:8000->8000/tcp
crafterslink-frontend   "/docker-entrypoint.…"   frontend            running             0.0.0.0:3000->80/tcp
crafterslink-postgres   "docker-entrypoint.s…"   postgres            running             5432/tcp
```

All three should show "running".

### Step 3: Check Backend Logs

```bash
docker-compose logs backend
```

Look for:
- ✅ "Starting development server at http://0.0.0.0:8000/"
- ✅ No database connection errors

If you see database errors, wait 10 seconds and check again (postgres takes time to start).

### Step 4: Run Migrations

Once postgres is running:

```bash
docker-compose exec backend python manage.py migrate
```

This creates all database tables.

### Step 5: Create Superuser (Admin)

```bash
docker-compose exec backend python manage.py createsuperuser
```

Follow prompts:
- Email: admin@crafterslink.com
- Password: (choose a password)

### Step 6: Seed Test Data

Check if seed command exists:

```bash
docker-compose exec backend python manage.py seed_data
```

If it works, great! If not, create test data manually:

```bash
docker-compose exec backend python manage.py shell
```

Then paste this:

```python
from apps.users.models import User
from apps.artisans.models import ArtisanProfile, Product
from django.contrib.auth.hashers import make_password

# Create artisan user
artisan_user = User.objects.create(
    email='artisan@test.com',
    username='artisan1',
    first_name='John',
    last_name='Craftsman',
    role='ARTISAN',
    password=make_password('test123'),
    is_verified=True
)

# Create artisan profile
artisan = ArtisanProfile.objects.create(
    user=artisan_user,
    business_name='John\'s Woodworks',
    bio='Expert woodworker with 15 years of experience creating custom furniture and decorative pieces. Specializing in traditional and modern designs using sustainably sourced materials.',
    county='NAIROBI',
    town='Westlands',
    craft_specialty='WOODWORKING',
    years_of_experience=15,
    business_registration='BN123456',
    portfolio_images=[
        'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=400',
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400'
    ]
)

# Create products
Product.objects.create(
    artisan=artisan,
    name='Handcrafted Oak Dining Table',
    description='Beautiful solid oak dining table with hand-carved details. Seats 6-8 people comfortably. Made from sustainably sourced oak wood with a natural oil finish. Perfect for both traditional and modern dining rooms. Each piece is unique and crafted with attention to detail.',
    material='Solid Oak Wood',
    length_cm=180,
    width_cm=90,
    height_cm=75,
    weight_kg=45,
    price_kes=85000,
    status='IN_STOCK',
    primary_image='https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600',
    additional_images=[
        'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600',
        'https://images.unsplash.com/photo-1595428773637-3b0c3c6f0f1e?w=600'
    ],
    craft_category='furniture',
    tags=['dining', 'oak', 'handmade', 'custom']
)

Product.objects.create(
    artisan=artisan,
    name='Custom Wooden Bookshelf',
    description='Elegant floor-to-ceiling bookshelf with adjustable shelves. Made from premium mahogany wood with a rich finish. Features 5 adjustable shelves and a sturdy construction that can hold heavy books. Perfect for home libraries or office spaces.',
    material='Mahogany Wood',
    length_cm=120,
    width_cm=30,
    height_cm=200,
    weight_kg=35,
    price_kes=55000,
    status='COMMISSIONABLE',
    primary_image='https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600',
    additional_images=[],
    craft_category='furniture',
    tags=['bookshelf', 'mahogany', 'storage', 'custom']
)

# Create designer user
designer = User.objects.create(
    email='designer@test.com',
    username='designer1',
    first_name='Jane',
    last_name='Designer',
    role='DESIGNER',
    password=make_password('test123'),
    is_verified=True
)

print("✅ Test data created!")
print(f"Artisan: {artisan.business_name} (ID: {artisan.id})")
print(f"Products: {Product.objects.filter(artisan=artisan).count()}")
print(f"Designer: {designer.email}")
print("\nLogin credentials:")
print("Designer: designer@test.com / test123")
print("Artisan: artisan@test.com / test123")

exit()
```

### Step 7: Verify Data

```bash
# Check database
docker-compose exec postgres psql -U crafterslink -d crafterslink

# Run these SQL commands:
SELECT COUNT(*) FROM artisans_artisanprofile;
SELECT COUNT(*) FROM products;
SELECT id, business_name FROM artisans_artisanprofile;

# Exit
\q
```

### Step 8: Test API

```bash
curl http://localhost:8000/api/v1/artisans/
```

Should return JSON with artisan data.

### Step 9: Test Frontend

1. Open http://localhost:3000
2. Login with: designer@test.com / test123
3. Navigate to catalogue
4. You should see artisan cards
5. Click an artisan card
6. Should load artisan detail page (no 404!)

---

## If Postgres Won't Start

### Check Docker Compose File

Make sure `docker-compose.yml` has postgres service:

```yaml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: crafterslink
      POSTGRES_USER: crafterslink
      POSTGRES_PASSWORD: crafterslink
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Check Logs

```bash
docker-compose logs postgres
```

Look for errors.

### Nuclear Option (Fresh Start)

```bash
# Stop everything
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait 10 seconds for postgres to initialize
sleep 10

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser and seed data (steps 5-6 above)
```

---

## Quick Command Summary

```bash
# 1. Start services
docker-compose up -d

# 2. Check status
docker-compose ps

# 3. Run migrations
docker-compose exec backend python manage.py migrate

# 4. Create test data
docker-compose exec backend python manage.py shell
# (paste Python code from above)

# 5. Verify
curl http://localhost:8000/api/v1/artisans/

# 6. Test frontend
# Open http://localhost:3000
```

---

## Success Indicators

✅ `docker-compose ps` shows all 3 services "running"  
✅ Backend logs show "Starting development server"  
✅ `curl http://localhost:8000/api/v1/artisans/` returns JSON  
✅ Database queries return data  
✅ Frontend loads without errors  
✅ Clicking artisan cards works (no 404)

Once all these are ✅, the catalogue browsing will work perfectly!