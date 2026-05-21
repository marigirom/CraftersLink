# Login Authentication Fix Applied ✅

## Issue
Login was failing with **400 Bad Request** error:
```
Failed to load resource: the server responded with a status of 400 (Bad Request)
Login error: AxiosError: Request failed with status code 400
```

## Root Cause
The User model has `USERNAME_FIELD = 'email'` but Django's default authentication backend was still trying to authenticate using username. The login serializer was calling `authenticate(username=email, password=password)` which wasn't working properly.

## Fix Applied

### 1. Created Custom Authentication Backend
**File:** [`backend/apps/users/backends.py`](backend/apps/users/backends.py:1) (NEW)

This custom backend allows users to authenticate using their email address instead of username:

```python
class EmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to log in using their email address.
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Try to fetch the user by email
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            return None
        
        # Check the password
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        
        return None
```

### 2. Updated Django Settings
**File:** [`backend/crafterslink/settings.py`](backend/crafterslink/settings.py:96-100)

Added the custom authentication backend:

```python
# Authentication Backends
AUTHENTICATION_BACKENDS = [
    'apps.users.backends.EmailBackend',  # Custom email authentication
    'django.contrib.auth.backends.ModelBackend',  # Fallback to default
]
```

## Required Action - Restart Backend

The backend container needs to be restarted to pick up the new authentication backend:

```bash
# Option 1: Quick restart
sudo docker compose restart backend

# Option 2: Full restart (if issues persist)
sudo docker compose down
sudo docker compose up -d

# Watch logs
sudo docker compose logs -f backend
```

## Test Login After Restart

### Test with Admin Account
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@crafterslink.com","password":"admin123"}' | jq
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@crafterslink.com",
      "first_name": "Admin",
      "last_name": "User",
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

### Test with Artisan Account
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"james.mwangi@crafterslink.ke","password":"CraftersLink2026!"}' | jq
```

### Test with Designer Account
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"amina.hassan@crafterslink.ke","password":"CraftersLink2026!"}' | jq
```

### Test in Frontend
1. Open http://localhost:5173/login
2. Enter email: admin@crafterslink.com
3. Enter password: admin123
4. Click Login
5. Should redirect to appropriate dashboard based on role

## Test Credentials

**Superuser:**
- admin@crafterslink.com / admin123

**Test Artisans:**
- james.mwangi@crafterslink.ke / CraftersLink2026!
- aisha.otieno@crafterslink.ke / CraftersLink2026!
- peter.kamau@crafterslink.ke / CraftersLink2026!
- grace.njeri@crafterslink.ke / CraftersLink2026!
- samuel.ochieng@crafterslink.ke / CraftersLink2026!

**Test Designers:**
- amina.hassan@crafterslink.ke / CraftersLink2026!
- brian.njoroge@crafterslink.ke / CraftersLink2026!
- carol.wanjiku@crafterslink.ke / CraftersLink2026!

## How It Works

1. **User enters email and password** in login form
2. **Frontend sends POST** to `/api/v1/auth/login/`
3. **Backend receives request**, validates with `UserLoginSerializer`
4. **Serializer calls** `authenticate(username=email, password=password)`
5. **EmailBackend intercepts**, looks up user by email
6. **Password is checked** using Django's secure password hashing
7. **JWT tokens generated** if authentication successful
8. **Tokens returned** to frontend for subsequent API calls

## Verification Checklist

After restarting backend, verify:

- [ ] Backend container is running (`sudo docker compose ps`)
- [ ] No errors in backend logs (`sudo docker compose logs backend`)
- [ ] Health check passes (`curl http://localhost:8000/api/v1/health/`)
- [ ] Admin login works (curl command above)
- [ ] Artisan login works (curl command above)
- [ ] Designer login works (curl command above)
- [ ] Frontend login works (browser test)
- [ ] Correct dashboard redirect based on role
- [ ] JWT tokens stored in localStorage
- [ ] Protected routes accessible after login

## Troubleshooting

### If login still fails after restart:

1. **Check backend logs for errors:**
   ```bash
   sudo docker compose logs backend --tail 50
   ```

2. **Verify authentication backend is loaded:**
   ```bash
   sudo docker compose exec backend python manage.py shell
   ```
   ```python
   from django.conf import settings
   print(settings.AUTHENTICATION_BACKENDS)
   # Should show: ['apps.users.backends.EmailBackend', ...]
   ```

3. **Test user exists in database:**
   ```bash
   sudo docker compose exec backend python manage.py shell
   ```
   ```python
   from apps.users.models import User
   user = User.objects.get(email='admin@crafterslink.com')
   print(user.email, user.check_password('admin123'))
   # Should print: admin@crafterslink.com True
   ```

4. **If still failing, rebuild backend:**
   ```bash
   sudo docker compose down
   sudo docker compose build backend --no-cache
   sudo docker compose up -d
   ```

## Files Modified

1. **[backend/apps/users/backends.py](backend/apps/users/backends.py:1)** - NEW - Custom email authentication backend
2. **[backend/crafterslink/settings.py](backend/crafterslink/settings.py:96-100)** - Added AUTHENTICATION_BACKENDS setting

## Status

✅ **Fix Applied** - Custom authentication backend created  
✅ **Settings Updated** - Backend configured to use email authentication  
⏳ **Restart Required** - Backend container must be restarted  
⏳ **Testing Pending** - Login should work after restart

---

Made with Bob 🤖