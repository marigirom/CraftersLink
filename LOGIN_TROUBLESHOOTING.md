# Login Issue - Comprehensive Troubleshooting Guide

## Current Status
Login is still failing with 400 Bad Request after adding custom authentication backend.

## Why It's Still Failing

The backend container needs to be **REBUILT**, not just restarted, because we added a new file (`backends.py`). Docker doesn't automatically pick up new files without rebuilding the image.

## Solution - Rebuild Backend Container

```bash
# Stop all containers
sudo docker compose down

# Rebuild backend without cache
sudo docker compose build backend --no-cache

# Start all containers
sudo docker compose up -d

# Watch logs to verify successful startup
sudo docker compose logs -f backend
```

## Verify the Fix Was Applied

After rebuilding, check that the authentication backend is loaded:

```bash
# Enter Django shell
sudo docker compose exec backend python manage.py shell

# Run this Python code:
from django.conf import settings
print("Authentication Backends:")
for backend in settings.AUTHENTICATION_BACKENDS:
    print(f"  - {backend}")

# Should output:
# Authentication Backends:
#   - apps.users.backends.EmailBackend
#   - django.contrib.auth.backends.ModelBackend
```

## Test Login Manually

### 1. Test with curl (bypasses frontend issues):

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crafterslink.com","password":"admin123"}' \
  -v
```

**Expected Success Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@crafterslink.com",
      "role": "ARTISAN",
      ...
    },
    "tokens": {
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  },
  "message": "Login successful"
}
```

**If you get 400 Bad Request**, check the response body for the actual error message.

### 2. Check Backend Logs for Detailed Error:

```bash
sudo docker compose logs backend --tail 50 | grep -i "login\|error\|400"
```

### 3. Test User Exists and Password is Correct:

```bash
sudo docker compose exec backend python manage.py shell
```

```python
from apps.users.models import User

# Check if admin user exists
try:
    user = User.objects.get(email='admin@crafterslink.com')
    print(f"User found: {user.email}")
    print(f"Username: {user.username}")
    print(f"Is active: {user.is_active}")
    print(f"Password check: {user.check_password('admin123')}")
except User.DoesNotExist:
    print("User does not exist!")
```

**Expected output:**
```
User found: admin@crafterslink.com
Username: admin
Is active: True
Password check: True
```

## Common Issues and Solutions

### Issue 1: User doesn't exist
**Solution:** Run seed command again:
```bash
sudo docker compose exec backend python manage.py seed_crafterslink
```

### Issue 2: Wrong password format in database
**Solution:** Reset admin password:
```bash
sudo docker compose exec backend python manage.py shell
```
```python
from apps.users.models import User
user = User.objects.get(email='admin@crafterslink.com')
user.set_password('admin123')
user.save()
print("Password reset successfully")
```

### Issue 3: Authentication backend not loaded
**Solution:** Verify settings.py was updated correctly:
```bash
sudo docker compose exec backend cat /app/crafterslink/settings.py | grep -A 3 "AUTHENTICATION_BACKENDS"
```

Should show:
```python
AUTHENTICATION_BACKENDS = [
    'apps.users.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]
```

### Issue 4: backends.py file not in container
**Solution:** Verify file exists in container:
```bash
sudo docker compose exec backend ls -la /app/apps/users/backends.py
```

If file doesn't exist, the container wasn't rebuilt. Go back to rebuild step.

## Alternative: Manual Login Test in Django Shell

```bash
sudo docker compose exec backend python manage.py shell
```

```python
from django.contrib.auth import authenticate
from apps.users.models import User

# Test authentication
user = authenticate(username='admin@crafterslink.com', password='admin123')

if user:
    print(f"✅ Authentication successful!")
    print(f"User: {user.email}")
    print(f"Role: {user.role}")
else:
    print("❌ Authentication failed!")
    
    # Debug: Check if user exists
    try:
        u = User.objects.get(email='admin@crafterslink.com')
        print(f"User exists: {u.email}")
        print(f"Password check: {u.check_password('admin123')}")
    except User.DoesNotExist:
        print("User does not exist in database")
```

## Frontend Debugging

If backend login works but frontend still fails, check:

### 1. Check browser console for full error:
Open DevTools → Console → Look for the full error object

### 2. Check Network tab:
- Request URL: Should be `http://localhost:8000/api/v1/auth/login/`
- Request Method: POST
- Request Payload: Should contain `{"email":"...","password":"..."}`
- Response: Check the actual error message in response body

### 3. Check CORS:
```bash
curl -X OPTIONS http://localhost:8000/api/v1/auth/login/ \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Should return CORS headers allowing the request.

## Complete Rebuild Procedure

If nothing else works, do a complete clean rebuild:

```bash
# 1. Stop everything
sudo docker compose down

# 2. Remove all containers and volumes
sudo docker compose down -v

# 3. Remove backend image
sudo docker rmi crafterslink-backend

# 4. Rebuild from scratch
sudo docker compose build --no-cache

# 5. Start fresh
sudo docker compose up -d

# 6. Watch logs
sudo docker compose logs -f backend

# 7. Wait for seed data to complete
# Look for: "✅ Backend initialization complete!"

# 8. Test login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crafterslink.com","password":"admin123"}'
```

## Expected Timeline

- **Rebuild:** 2-5 minutes
- **Startup + Seed:** 1-2 minutes
- **Total:** ~5-7 minutes

## Success Criteria

✅ Backend container running without errors  
✅ Authentication backend loaded in settings  
✅ backends.py file exists in container  
✅ Admin user exists in database  
✅ Password check returns True  
✅ curl login test returns 200 with tokens  
✅ Frontend login redirects to dashboard  

## If Still Failing After All Steps

Please provide:
1. Full backend logs: `sudo docker compose logs backend > backend.log`
2. curl login response: Save the full response including headers
3. Django shell authentication test results
4. Browser console error (full error object, not just message)

---

Made with Bob 🤖