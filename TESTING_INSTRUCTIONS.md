# How to Test the Catalogue Fix

## The Issue You're Experiencing

You're currently:
1. ✅ Logged in as **John Craftsman (ARTISAN)** 
2. ❌ Viewing the **public catalogue** at `/catalogue`
3. ❌ The public catalogue uses old routes that don't have detail pages

## What You Need to Do

### Step 1: Logout and Login as Designer

1. Click "Logout" in the top right
2. Login with **DESIGNER** credentials:
   - Email: `designer@test.com`
   - Password: `test123`

### Step 2: Navigate to Designer Dashboard

After login, you should be redirected to `/dashboard/designer`

If not, manually navigate to: `http://localhost:3000/dashboard/designer`

### Step 3: Access Designer Catalogue

From the designer dashboard, you have several ways to access the catalogue:

**Option A: Click "Browse Catalogue" button**
- Look for a button that says "Browse Catalogue" or "Browse All"
- This will take you to `/dashboard/designer/catalogue`

**Option B: Direct URL**
- Navigate directly to: `http://localhost:3000/dashboard/designer/catalogue`

### Step 4: Test the Flow

Once on `/dashboard/designer/catalogue`:

1. ✅ You should see artisan cards
2. ✅ Click an artisan card
3. ✅ Should navigate to `/dashboard/designer/catalogue/1` (artisan detail page)
4. ✅ Should show artisan profile + their products
5. ✅ Click a product card
6. ✅ Should navigate to `/dashboard/designer/catalogue/1/1` (item detail page)
7. ✅ Should show full item details

**NO 404 ERRORS!** ✅

---

## Why the Public Catalogue Doesn't Work

The public catalogue at `/catalogue` is a different page that:
- Uses the old `ArtisanSearch` component
- Has links to `/artisan/:id` (not implemented)
- Is meant for public browsing (not logged-in designers)

The **designer-specific catalogue** at `/dashboard/designer/catalogue` is what we fixed:
- Uses the new `CatalogueBrowse` component
- Has links to `/dashboard/designer/catalogue/:artisanId`
- Has full detail pages with all features

---

## Quick Test Commands

If you need to create a designer user:

```bash
docker-compose exec backend python manage.py shell
```

```python
from apps.users.models import User
from django.contrib.auth.hashers import make_password

# Check if designer exists
designer = User.objects.filter(email='designer@test.com').first()

if not designer:
    designer = User.objects.create(
        email='designer@test.com',
        username='designer1',
        first_name='Jane',
        last_name='Designer',
        role='DESIGNER',
        password=make_password('test123'),
        is_verified=True
    )
    print("✅ Designer created!")
else:
    print(f"✅ Designer already exists: {designer.email}")

print(f"Login with: {designer.email} / test123")
exit()
```

---

## Expected URLs

### ❌ OLD (Public Catalogue - Not Fixed)
- `/catalogue` → Public catalogue page
- `/artisan/:id` → **404 (not implemented)**

### ✅ NEW (Designer Catalogue - Fixed)
- `/dashboard/designer/catalogue` → Designer catalogue browse
- `/dashboard/designer/catalogue/:artisanId` → Artisan detail page ✅
- `/dashboard/designer/catalogue/:artisanId/:itemId` → Item detail page ✅

---

## Summary

**To test the fix:**
1. Logout from artisan account
2. Login as designer (designer@test.com / test123)
3. Go to `/dashboard/designer/catalogue`
4. Click artisan cards → Should work!
5. Click item cards → Should work!

The public catalogue at `/catalogue` is a separate feature that wasn't part of this fix.