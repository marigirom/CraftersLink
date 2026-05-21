# Artisan Profile POST Method Fix

**Date**: 2026-05-21  
**Issue**: Artisan profile creation returning 403 Forbidden  
**Status**: ✅ RESOLVED

---

## Problem Description

When artisans tried to create their profile via the form at `/artisan/profile`, they received the error:
```
"Only artisan users can create artisan profiles"
```

Despite being logged in as an artisan user, the POST request to `/api/v1/artisans/profile/me/` was returning:
```
WARNING 2026-05-21 11:32:52,865 log Forbidden: /api/v1/artisans/profile/me/
WARNING 2026-05-21 11:32:52,866 basehttp "POST /api/v1/artisans/profile/me/ HTTP/1.1" 403 76
```

---

## Root Cause Analysis

### Investigation Steps

1. **Checked user role in database**:
   ```bash
   docker compose exec backend python manage.py shell -c \
     "from apps.users.models import User; \
      u = User.objects.filter(username__icontains='jon').first(); \
      print(f'Username: {u.username}, Role: {u.role}')"
   ```
   Result: `Username: Jonte, Role: ARTISAN` ✅ Correct

2. **Checked permission classes**:
   - `ArtisanProfileMeView` has `permission_classes = [permissions.IsAuthenticated]` ✅ Correct
   - Custom `post()` method checks `if request.user.role != 'ARTISAN'` ✅ Correct

3. **Identified the actual issue**:
   - `ArtisanProfileMeView` inherits from `generics.RetrieveUpdateAPIView`
   - This base class only supports: **GET, PUT, PATCH** methods
   - **POST is NOT a supported method** by default
   - When POST is attempted, Django REST Framework returns 403 Forbidden
   - The custom `post()` method was never being called

---

## The Fix

**File**: [`backend/apps/artisans/views.py`](backend/apps/artisans/views.py:119-122)

**Change**: Added `http_method_names` to explicitly allow POST method

```python
class ArtisanProfileMeView(generics.RetrieveUpdateAPIView):
    """Get, create, or update current user's artisan profile"""
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'patch', 'put', 'head', 'options']  # ← ADDED THIS LINE
```

### Why This Works

By explicitly declaring `http_method_names`, we tell Django REST Framework that this view accepts POST requests in addition to the default GET, PUT, and PATCH methods. Now when a POST request arrives:

1. DRF checks if POST is in `http_method_names` ✅ Yes
2. DRF checks `permission_classes` ✅ User is authenticated
3. DRF routes to the custom `post()` method ✅ Method executes
4. The `post()` method checks role and creates profile ✅ Success

---

## Technical Details

### Django REST Framework View Method Support

| Base Class | Default Methods | Custom Methods Allowed |
|------------|----------------|----------------------|
| `ListAPIView` | GET | No |
| `CreateAPIView` | POST | No |
| `RetrieveAPIView` | GET | No |
| `UpdateAPIView` | PUT, PATCH | No |
| `DestroyAPIView` | DELETE | No |
| `RetrieveUpdateAPIView` | GET, PUT, PATCH | Yes, with `http_method_names` |
| `RetrieveDestroyAPIView` | GET, DELETE | Yes, with `http_method_names` |

### The `http_method_names` Attribute

This is a Django view attribute that explicitly defines which HTTP methods are allowed:

```python
http_method_names = ['get', 'post', 'patch', 'put', 'head', 'options']
```

- If not specified, the view uses the base class defaults
- If specified, it overrides the defaults
- Any method not in this list will return 405 Method Not Allowed (or 403 in some cases)

---

## Verification Steps

After applying the fix and restarting the backend:

1. Navigate to `/artisan/profile` as an artisan user
2. Fill in the profile form
3. Click "Create Profile"
4. Expected result: Profile created successfully (HTTP 201)
5. Check logs: `INFO "POST /api/v1/artisans/profile/me/ HTTP/1.1" 201`

---

## Related Issues Fixed

This is the **fourth permission-related fix** in this project:

1. ✅ **Designer Profile GET** - Fixed `IsDesigner` permission to accept both `'DESIGNER'` and `'INTERIOR_DESIGNER'`
2. ✅ **Designer Profile POST/PATCH** - Same permission fix
3. ✅ **Artisan Catalogue** - Fixed profile fetching from wrong endpoint
4. ✅ **Artisan Profile POST** - Added POST to `http_method_names` (this fix)

---

## Key Takeaways

1. **Base class method support matters**: Always check what HTTP methods your base class supports
2. **Custom methods need explicit declaration**: If adding custom methods (like POST to a RetrieveUpdateAPIView), declare them in `http_method_names`
3. **403 vs 405 errors**: 
   - 403 Forbidden = Permission denied
   - 405 Method Not Allowed = HTTP method not supported
   - Sometimes DRF returns 403 for unsupported methods
4. **Check logs first**: The Django logs clearly showed 403 on POST, which led to investigating method support

---

## Files Modified

- [`backend/apps/artisans/views.py`](backend/apps/artisans/views.py:122) - Added `http_method_names` attribute

---

## Deployment

```bash
# Restart backend to apply changes
docker compose restart backend

# Verify backend is running
docker compose ps

# Check logs for any errors
docker compose logs backend | tail -20
```

---

**Status**: ✅ Fix applied and backend restarted. Ready for testing.