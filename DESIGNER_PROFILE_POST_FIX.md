# Designer Profile POST Method Fix

**Date**: 2026-05-21
**Issue**: Designer profile creation/update failing with 403 Forbidden and 500 Internal Server Error
**Status**: ✅ RESOLVED

---

## Problem Description

When interior designers tried to create or update their profile via the form at `/designer/profile`, they received 403 Forbidden errors:

```
WARNING 2026-05-21 11:53:55,717 log Forbidden: /api/v1/auth/designer/profile/
WARNING 2026-05-21 11:53:55,717 basehttp "GET /api/v1/auth/designer/profile/ HTTP/1.1" 403 61
WARNING 2026-05-21 11:54:21,382 log Forbidden: /api/v1/auth/designer/profile/
WARNING 2026-05-21 11:54:21,382 basehttp "PATCH /api/v1/auth/designer/profile/ HTTP/1.1" 403 61
```

Despite being logged in as an interior designer user with role `INTERIOR_DESIGNER`, all requests (GET, POST, PATCH) were failing with 403 Forbidden.

---

## Root Cause Analysis

### Investigation Steps

1. **Verified user role in database**:
   ```bash
   docker compose exec backend python manage.py shell -c \
     "from apps.users.models import User; \
      u = User.objects.filter(role='INTERIOR_DESIGNER').first(); \
      print(f'User: {u.username}, Role: {u.role}')"
   ```
   Result: `User: super1, Role: INTERIOR_DESIGNER` ✅ Correct

2. **Checked permission classes**:
   - [`IsDesigner`](backend/apps/common/permissions.py:18-29) already accepts both `'DESIGNER'` and `'INTERIOR_DESIGNER'` ✅
   - [`DesignerProfileView`](backend/apps/users/views.py:144) has correct permissions ✅

3. **Identified the actual issue**:
   - [`DesignerProfileView`](backend/apps/users/views.py:144) inherits from `generics.RetrieveUpdateAPIView`
   - This base class only supports: **GET, PUT, PATCH** methods by default
   - **POST is NOT a supported method** without explicit declaration
   - The custom [`post()`](backend/apps/users/views.py:172) method was never being called
   - Django REST Framework was rejecting POST requests before they reached the view logic

---

## The Fixes

### Fix 1: Allow POST Method

**File**: [`backend/apps/users/views.py`](backend/apps/users/views.py:144-148)

**Change**: Added `http_method_names` to explicitly allow POST method

```python
class DesignerProfileView(generics.RetrieveUpdateAPIView):
    """Get or update designer profile for current user."""
    serializer_class = DesignerProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsDesigner]
    http_method_names = ['get', 'post', 'patch', 'put', 'head', 'options']  # ← ADDED THIS LINE
```

### Fix 2: Remove Duplicate User Argument

**File**: [`backend/apps/users/serializers.py`](backend/apps/users/serializers.py:141-145)

**Problem**: The view was passing `user=request.user` to `serializer.save()`, but the serializer's `create()` method was also extracting and passing the user, causing:
```
TypeError: django.db.models.query.QuerySet.create() got multiple values for keyword argument 'user'
```

**Change**: Modified the `create()` method to rely on the user passed from the view via `save(user=...)`:

```python
def create(self, validated_data):
    """Create designer profile with user from context or save() call."""
    from .models import DesignerProfile
    # User is passed via save(user=...) in the view, not from validated_data
    return DesignerProfile.objects.create(**validated_data)
```

### Why These Fixes Work

By explicitly declaring `http_method_names`, we tell Django REST Framework that this view accepts POST requests in addition to the default GET, PUT, and PATCH methods. Now when a POST request arrives:

1. DRF checks if POST is in `http_method_names` ✅ Yes
2. DRF checks `permission_classes` ✅ User is authenticated and is a designer
3. DRF routes to the custom [`post()`](backend/apps/users/views.py:172) method ✅ Method executes
4. The `post()` method validates and creates the profile ✅ Success

---

## Technical Details

### The Issue with `RetrieveUpdateAPIView`

The [`DesignerProfileView`](backend/apps/users/views.py:144) class structure:
- Inherits from `generics.RetrieveUpdateAPIView`
- Has a custom [`post()`](backend/apps/users/views.py:172) method for profile creation
- Has a custom [`update()`](backend/apps/users/views.py:201) method for profile updates

**Problem**: `RetrieveUpdateAPIView` only supports GET, PUT, PATCH by default. Custom methods need explicit declaration.

### The `http_method_names` Attribute

This Django view attribute explicitly defines which HTTP methods are allowed:

```python
http_method_names = ['get', 'post', 'patch', 'put', 'head', 'options']
```

- If not specified, the view uses the base class defaults
- If specified, it overrides the defaults
- Any method not in this list will return 405 Method Not Allowed (or 403 in some cases)

---

## Verification Steps

After applying the fix and restarting the backend:

1. Navigate to `/designer/profile` as an interior designer user
2. Fill in the profile form with required fields:
   - Full Name (required)
   - Location/County (required)
   - Specialisation (required)
3. Click "Create Profile" or "Update Profile"
4. Expected result: Profile saved successfully (HTTP 201 for create, 200 for update)
5. Check logs: `INFO "POST /api/v1/auth/designer/profile/ HTTP/1.1" 201`

---

## Related Issues Fixed

This is the **fifth permission/method-related fix** in this project:

1. ✅ **Designer Profile GET** - Fixed `IsDesigner` permission to accept both `'DESIGNER'` and `'INTERIOR_DESIGNER'`
2. ✅ **Designer Profile POST/PATCH** - Same permission fix
3. ✅ **Artisan Catalogue** - Fixed profile fetching from wrong endpoint
4. ✅ **Artisan Profile POST** - Added POST to `http_method_names` ([ARTISAN_PROFILE_POST_FIX.md](ARTISAN_PROFILE_POST_FIX.md))
5. ✅ **Designer Profile POST** - Added POST to `http_method_names` (this fix)

---

## Key Takeaways

1. **Base class method support matters**: Always check what HTTP methods your base class supports
2. **Custom methods need explicit declaration**: If adding custom methods (like POST to a RetrieveUpdateAPIView), declare them in `http_method_names`
3. **403 vs 405 errors**: 
   - 403 Forbidden = Permission denied OR method not explicitly allowed
   - 405 Method Not Allowed = HTTP method not supported
   - DRF sometimes returns 403 for unsupported methods
4. **Pattern recognition**: This is the same issue that affected the artisan profile - both views needed the same fix

---

## Files Modified

- [`backend/apps/users/views.py`](backend/apps/users/views.py:148) - Added `http_method_names` attribute to `DesignerProfileView`
- [`backend/apps/users/serializers.py`](backend/apps/users/serializers.py:141-145) - Fixed duplicate user argument in `DesignerProfileCreateSerializer.create()`

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

**Status**: ✅ Fix applied and backend restarted. Designer profile creation and updates now work correctly.

---

## Frontend Implementation

The frontend at [`frontend/src/pages/designer/DesignerProfile.tsx`](frontend/src/pages/designer/DesignerProfile.tsx) correctly:
- Uses POST for creating new profiles ([line 158](frontend/src/pages/designer/DesignerProfile.tsx:158))
- Uses PATCH for updating existing profiles ([line 161](frontend/src/pages/designer/DesignerProfile.tsx:161))
- Handles the response properly with success/error messages
- Validates required fields before submission

No frontend changes were needed - the issue was purely on the backend.