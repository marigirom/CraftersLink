# Diagnostic Guide & Database Access

## Possible Causes of Persistent Errors

### 1. **No Data in Database** (Most Likely)
**Symptom:** API returns empty arrays or 404 errors  
**Cause:** Database tables are empty - no artisans or products exist  
**Solution:** Need to seed the database with test data

### 2. **Backend Not Restarted**
**Symptom:** New endpoints return 404  
**Cause:** Code changes not loaded - old Python code still running  
**Solution:** Restart backend container

### 3. **Database Migration Not Run**
**Symptom:** Database errors, missing columns  
**Cause:** Database schema doesn't match models  
**Solution:** Run migrations

### 4. **API Base URL Mismatch**
**Symptom:** Frontend can't reach backend  
**Cause:** Frontend calling wrong URL  
**Check:** Browser console network tab

### 5. **CORS Issues**
**Symptom:** API calls blocked by browser  
**Cause:** Backend not allowing frontend origin  
**Check:** Browser console for CORS errors

---

## Step-by-Step Diagnostic Process

### Step 1: Check if Backend is Running

```bash
# Check container status
docker-compose ps

# Expected output should show:
# backend    running    0.0.0.0:8000->8000/tcp
# frontend   running    0.0.0.0:3000->80/tcp
# postgres   running    5432/tcp
```

### Step 2: Check Backend Logs

```bash
# View backend logs
docker-compose logs backend

# Look for:
# - "Starting development server at http://0.0.0.0:8000/"
# - Any error messages
# - Import errors
# - Database connection errors
```

### Step 3: Test Backend API Directly

```bash
# Test if backend is responding
curl http://localhost:8000/api/v1/artisans/

# Expected: JSON response with artisans list (may be empty)
# If error: Backend not running or has issues
```

### Step 4: Check Browser Console

1. Open browser (Chrome/Firefox)
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for:
   - Red error messages
   - "Failed to fetch"
   - CORS errors
   - 404 errors with URLs
5. Go to Network tab
6. Click on failed requests
7. Check:
   - Request URL
   - Response status
   - Response body

---

## How to Access the Database

### Method 1: Using Docker Exec (Recommended)

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U crafterslink -d crafterslink

# You're now in PostgreSQL shell
# Run these commands:

# List all tables
\dt

# View artisan profiles
SELECT id, business_name FROM artisans_artisanprofile;

# View products
SELECT id, name, artisan_id FROM products;

# View users
SELECT id, email, role FROM users_user;

# Count records
SELECT COUNT(*) FROM artisans_artisanprofile;
SELECT COUNT(*) FROM products;

# Exit PostgreSQL
\q
```

### Method 2: Using Django Shell

```bash
# Access Django shell
docker-compose exec backend python manage.py shell

# You're now in Python shell
# Run these commands:
```

```python
from apps.artisans.models import ArtisanProfile, Product
from apps.users.models import User

# Count artisans
print(f"Artisans: {ArtisanProfile.objects.count()}")

# Count products
print(f"Products: {Product.objects.count()}")

# List all artisans
for artisan in ArtisanProfile.objects.all():
    print(f"ID: {artisan.id}, Name: {artisan.business_name}")

# List all products
for product in Product.objects.all():
    print(f"ID: {product.id}, Name: {product.name}, Artisan: {product.artisan.business_name}")

# Exit Python shell
exit()
```

### Method 3: Using pgAdmin (GUI Tool)

1. Install pgAdmin: https://www.pgadmin.org/download/
2. Open pgAdmin
3. Add new server:
   - Host: localhost
   - Port: 5432
   - Database: crafterslink
   - Username: crafterslink
   - Password: (check docker-compose.yml or .env)
4. Browse tables visually

---

## How to Seed the Database

### Check if Seed Command Exists

```bash
# List available management commands
docker-compose exec backend python manage.py help

# Look for 'seed_data' in the list
```

### Run Seed Command

```bash
# If seed_data command exists
docker-compose exec backend python manage.py seed_data

# Expected output:
# "Seeding database..."
# "Created X users"
# "Created X artisans"
# "Created X products"
# "Seeding complete!"
```

### If Seed Command Doesn't Exist

You'll need to create test data manually. Here's a script:

```bash
# Access Django shell
docker-compose exec backend python manage.py shell
```

```python
from apps.users.models import User
from apps.artisans.models import ArtisanProfile, Product
from django.contrib.auth.hashers import make_password

# Create test artisan user
artisan_user = User.objects.create(
    email='artisan1@test.com',
    username='artisan1',
    first_name='John',
    last_name='Craftsman',
    role='ARTISAN',
    password=make_password('password123'),
    is_verified=True
)

# Create artisan profile
artisan = ArtisanProfile.objects.create(
    user=artisan_user,
    business_name='John\'s Woodworks',
    bio='Expert woodworker with 15 years of experience creating custom furniture and decorative pieces. Specializing in traditional and modern designs.',
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

# Create test products
Product.objects.create(
    artisan=artisan,
    name='Handcrafted Oak Dining Table',
    description='Beautiful solid oak dining table with hand-carved details. Seats 6-8 people comfortably. Made from sustainably sourced oak wood with a natural oil finish. Perfect for both traditional and modern dining rooms.',
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
    description='Elegant floor-to-ceiling bookshelf with adjustable shelves. Made from premium mahogany wood with a rich finish. Features 5 adjustable shelves and a sturdy construction that can hold heavy books.',
    material='Mahogany Wood',
    length_cm=120,
    width_cm=30,
    height_cm=200,
    weight_kg=35,
    price_kes=55000,
    status='COMMISSIONABLE',
    primary_image='https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600',
    additional_images=[
        'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600'
    ],
    craft_category='furniture',
    tags=['bookshelf', 'mahogany', 'storage', 'custom']
)

print("✅ Test data created successfully!")
print(f"Artisan: {artisan.business_name} (ID: {artisan.id})")
print(f"Products: {Product.objects.filter(artisan=artisan).count()}")

exit()
```

### Create Designer User for Testing

```bash
docker-compose exec backend python manage.py shell
```

```python
from apps.users.models import User
from django.contrib.auth.hashers import make_password

designer = User.objects.create(
    email='designer1@test.com',
    username='designer1',
    first_name='Jane',
    last_name='Designer',
    role='DESIGNER',
    password=make_password('password123'),
    is_verified=True
)

print(f"✅ Designer created: {designer.email}")
print("Login with: designer1@test.com / password123")

exit()
```

---

## Verification After Seeding

### 1. Check Database

```bash
docker-compose exec postgres psql -U crafterslink -d crafterslink

SELECT COUNT(*) FROM artisans_artisanprofile;
SELECT COUNT(*) FROM products;

\q
```

### 2. Test API Endpoints

```bash
# List artisans
curl http://localhost:8000/api/v1/artisans/

# Get specific artisan (use ID from database)
curl http://localhost:8000/api/v1/artisans/1/

# List products
curl http://localhost:8000/api/v1/artisans/products/

# Get artisan catalogue
curl http://localhost:8000/api/v1/artisans/catalogue/1/
```

### 3. Test Frontend

1. Open http://localhost:3000
2. Login with: designer1@test.com / password123
3. Navigate to catalogue
4. You should see artisan cards
5. Click an artisan card
6. You should see artisan detail page with products

---

## Common Issues and Solutions

### Issue: "relation does not exist"
**Cause:** Migrations not run  
**Solution:**
```bash
docker-compose exec backend python manage.py migrate
```

### Issue: Empty API responses but no errors
**Cause:** No data in database  
**Solution:** Seed database (see above)

### Issue: "Connection refused" when calling API
**Cause:** Backend not running  
**Solution:**
```bash
docker-compose restart backend
docker-compose logs -f backend
```

### Issue: Frontend shows blank page
**Cause:** JavaScript error  
**Solution:** Check browser console (F12)

### Issue: "CORS policy" error
**Cause:** Backend CORS not configured  
**Solution:** Check `settings.py` CORS settings

---

## Quick Diagnostic Script

Save this as `diagnose.sh` and run it:

```bash
#!/bin/bash

echo "=== CraftersLink Diagnostic ==="
echo ""

echo "1. Checking containers..."
docker-compose ps
echo ""

echo "2. Checking backend health..."
curl -s http://localhost:8000/api/v1/artisans/ | head -c 100
echo ""
echo ""

echo "3. Checking database..."
docker-compose exec -T postgres psql -U crafterslink -d crafterslink -c "SELECT COUNT(*) as artisans FROM artisans_artisanprofile;"
docker-compose exec -T postgres psql -U crafterslink -d crafterslink -c "SELECT COUNT(*) as products FROM products;"
echo ""

echo "4. Checking backend logs (last 20 lines)..."
docker-compose logs --tail=20 backend
echo ""

echo "=== Diagnostic Complete ==="
```

Run it:
```bash
chmod +x diagnose.sh
./diagnose.sh
```

---

## Next Steps Based on Findings

### If Database is Empty:
1. Run seed command or create test data manually
2. Verify data was created
3. Test API endpoints
4. Test frontend

### If Backend Has Errors:
1. Check logs for specific error
2. Fix the error in code
3. Restart backend
4. Test again

### If Frontend Can't Reach Backend:
1. Check API base URL in frontend code
2. Check CORS settings in backend
3. Check network tab in browser
4. Verify both containers are running

---

## Contact Points for Further Help

If issues persist after following this guide:

1. **Share these details:**
   - Output of `docker-compose ps`
   - Output of `docker-compose logs backend`
   - Browser console errors (screenshot)
   - Network tab showing failed requests

2. **Specific information needed:**
   - What URL are you trying to access?
   - What error message do you see?
   - What does the browser console show?
   - What does the backend log show?

This will help diagnose the exact issue quickly.