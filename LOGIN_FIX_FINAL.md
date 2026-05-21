# Login Fix - Final Solution (No Seed Data)

## The Real Issue

Login is failing because the custom authentication backend we created isn't loaded in the running container. The container needs to be rebuilt to include the new `backends.py` file.

## Quick Fix - Rebuild Backend

```bash
# 1. Stop and rebuild backend
sudo docker compose down
sudo docker compose build backend --no-cache
sudo docker compose up -d

# 2. Watch logs
sudo docker compose logs -f backend
```

**Wait for:** "✅ Backend initialization complete!"

## What We Fixed

### 1. Created Custom Email Authentication Backend
**File:** [`backend/apps/users/backends.py`](backend/apps/users/backends.py:1)

Allows users to login with email instead of username.

### 2. Updated Django Settings
**File:** [`backend/crafterslink/settings.py`](backend/crafterslink/settings.py:96-100)

```python
AUTHENTICATION_BACKENDS = [
    'apps.users.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]
```

### 3. Removed Automatic Seed Data
**File:** [`backend/docker-entrypoint.sh`](backend/docker-entrypoint.sh:42-44)

Seed data is now optional. You can create your own users.

## Test Login with Existing Users

### Check What Users Exist

```bash
sudo docker compose exec backend python manage.py shell
```

```python
from apps.users.models import User

# List all users
users = User.objects.all()
for user in users:
    print(f"Email: {user.email}, Role: {user.role}, Active: {user.is_active}")
```

### Test Login with Existing User

If you have existing users in the database, try logging in with their credentials.

### Create a Test User Manually

If no users exist, create one:

```bash
sudo docker compose exec backend python manage.py shell
```

```python
from apps.users.models import User

# Create a test artisan
user = User.objects.create_user(
    email='test@example.com',
    username='testuser',
    password='testpass123',
    first_name='Test',
    last_name='User',
    role='ARTISAN',
    phone_number='+254700000000'
)
print(f"Created user: {user.email}")
```

Then login with:
- Email: test@example.com
- Password: testpass123

## Test Login

### Via curl:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

**Expected:** JSON with `"success": true` and JWT tokens

### Via Frontend:
1. Open http://localhost:5173/login
2. Enter your user's email and password
3. Should redirect to dashboard based on role

## Create Superuser (Admin)

To access Django admin panel:

```bash
sudo docker compose exec backend python manage.py createsuperuser
```

Follow the prompts to create an admin account.

## Verify Authentication Backend is Loaded

After rebuild, verify:

```bash
sudo docker compose exec backend python manage.py shell
```

```python
from django.conf import settings
print("Authentication Backends:")
for backend in settings.AUTHENTICATION_BACKENDS:
    print(f"  ✓ {backend}")
```

Should show:
```
Authentication Backends:
  ✓ apps.users.backends.EmailBackend
  ✓ django.contrib.auth.backends.ModelBackend
```

## If Login Still Fails

### 1. Check Backend Logs
```bash
sudo docker compose logs backend --tail 100
```

Look for any errors related to authentication.

### 2. Test Authentication Directly
```bash
sudo docker compose exec backend python manage.py shell
```

```python
from django.contrib.auth import authenticate

# Replace with your actual user email and password
user = authenticate(username='test@example.com', password='testpass123')

if user:
    print(f"✅ Authentication works! User: {user.email}")
else:
    print("❌ Authentication failed")
    
    # Check if user exists
    from apps.users.models import User
    try:
        u = User.objects.get(email='test@example.com')
        print(f"User exists: {u.email}")
        print(f"Is active: {u.is_active}")
        print(f"Password check: {u.check_password('testpass123')}")
    except User.DoesNotExist:
        print("User does not exist")
```

### 3. Check CORS
```bash
curl -X OPTIONS http://localhost:8000/api/v1/auth/login/ \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should return CORS headers allowing the request.

### 4. Check Frontend API URL
Verify frontend is calling the correct API URL:
- Should be: `http://localhost:8000/api/v1/auth/login/`
- Check in browser DevTools → Network tab

## Registration Flow

Users can register through the frontend:
1. Go to http://localhost:5173/register
2. Fill in the form
3. Select role (Artisan or Designer)
4. Submit
5. Should redirect to login
6. Login with the registered credentials

## Summary

**Files Modified:**
1. ✅ `backend/apps/users/backends.py` - NEW - Email authentication
2. ✅ `backend/crafterslink/settings.py` - Added AUTHENTICATION_BACKENDS
3. ✅ `backend/docker-entrypoint.sh` - Removed automatic seed data

**Action Required:**
- Rebuild backend container (commands above)
- Use existing users OR create new ones manually
- Test login with your user credentials

**No seed data will be created automatically.**

---

Made with Bob 🤖