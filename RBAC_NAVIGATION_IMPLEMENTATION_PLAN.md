# RBAC Navigation & Dashboard Implementation Plan

## Current State Analysis

### ✅ Already Working
1. **AuthContext** - Properly exposes user.role, user.id, user.first_name, user.last_name
2. **Login.tsx** - Has role-based redirect (lines 78-84)
3. **ProtectedRoute** - Has basic role checking
4. **authService.ts** - Properly handles User type with role field

### ❌ Issues Found
1. **Role Mismatch**: Backend uses `INTERIOR_DESIGNER` but frontend expects `DESIGNER`
2. **Header Navigation**: Shows same tabs for both roles
3. **Dashboard Routes**: Not properly separated by role
4. **Post-login routing**: Needs to redirect to role-specific dashboards
5. **Root route (/)**: Doesn't redirect authenticated users to their dashboard

## Implementation Tasks

### Task 1: Fix Role Mapping in AuthContext & Types
**File**: `frontend/src/context/AuthContext.tsx`
- User type already correct (uses DESIGNER)
- No changes needed

**File**: `frontend/src/services/authService.ts`  
- User type already correct
- No changes needed

### Task 2: Update Header with Role-Specific Navigation
**File**: `frontend/src/components/shared/Header.tsx`

**Artisan Navigation** (when user.role === 'ARTISAN'):
- Dashboard → `/artisan/dashboard`
- My Catalogue → `/artisan/catalogue`
- My Commissions → `/artisan/commissions`
- Profile → `/artisan/profile`

**Designer Navigation** (when user.role === 'INTERIOR_DESIGNER' or 'DESIGNER'):
- Dashboard → `/designer/dashboard`
- Discover Artisans → `/designer/catalogue`
- My Commissions → `/designer/commissions`
- Profile → `/designer/profile`

### Task 3: Enhance ProtectedRoute
**File**: `frontend/src/components/ProtectedRoute.tsx`

Add two-level protection:
1. **Level 1**: Authentication check
2. **Level 2**: Role-based redirect
   - Artisan accessing `/designer/*` → redirect to `/artisan/dashboard`
   - Designer accessing `/artisan/*` → redirect to `/designer/dashboard`

### Task 4: Update Login & Register Redirects
**File**: `frontend/src/pages/Login.tsx`
- ✅ Already redirects based on role (lines 78-84)
- Update to use `/artisan/dashboard` and `/designer/dashboard`

**File**: `frontend/src/pages/Register.tsx`
- Currently redirects to `/login?registered=true`
- Keep this behavior (login will handle role-based redirect)

### Task 5: Build Role-Specific Dashboards
**File**: `frontend/src/pages/artisan/ArtisanDashboard.tsx` (NEW)
- Stats: Total Products, New Requests, Active Jobs, Completed Projects
- Recent Commission Requests table
- Quick Actions: Add Product, View Profile

**File**: `frontend/src/pages/designer/DesignerDashboard.tsx` (NEW)
- Stats: Commissions Sent, Pending, Active, Completed
- Recent Commissions table
- Quick Actions: Discover Artisans, View Profile

### Task 6: Update App.tsx Routes
**File**: `frontend/src/App.tsx`

Add role-specific routes:
```
/artisan/dashboard → ArtisanDashboard (ARTISAN only)
/artisan/catalogue → ArtisanCatalogue (ARTISAN only)
/artisan/commissions → ArtisanCommissions (ARTISAN only)
/artisan/profile → ArtisanProfile (ARTISAN only)

/designer/dashboard → DesignerDashboard (INTERIOR_DESIGNER only)
/designer/catalogue → CatalogueBrowse (INTERIOR_DESIGNER only)
/designer/commissions → DesignerCommissions (INTERIOR_DESIGNER only)
/designer/profile → DesignerProfile (INTERIOR_DESIGNER only)

/ → Redirect to role-specific dashboard if authenticated
/dashboard → Redirect to role-specific dashboard
```

## Role Value Mapping

**Backend** sends: `INTERIOR_DESIGNER` or `ARTISAN`
**Frontend** expects: `DESIGNER` or `ARTISAN`

**Solution**: Update ProtectedRoute and Header to handle both `DESIGNER` and `INTERIOR_DESIGNER` as designer role.

## Implementation Order

1. ✅ Update Header with role-specific navigation
2. ✅ Enhance ProtectedRoute with two-level guards
3. ✅ Update Login.tsx redirect paths
4. ✅ Build new ArtisanDashboard
5. ✅ Build new DesignerDashboard  
6. ✅ Update App.tsx with all role-specific routes
7. ✅ Test all navigation flows

## Testing Checklist

- [ ] Artisan login → redirects to `/artisan/dashboard`
- [ ] Designer login → redirects to `/designer/dashboard`
- [ ] Artisan sees only artisan nav tabs
- [ ] Designer sees only designer nav tabs
- [ ] Artisan accessing `/designer/*` → redirected to `/artisan/dashboard`
- [ ] Designer accessing `/artisan/*` → redirected to `/designer/dashboard`
- [ ] Root `/` redirects authenticated users to their dashboard
- [ ] Logout clears all state and redirects to `/login`
- [ ] All dashboard stats load correctly
- [ ] All navigation links work correctly

## Files to Modify

1. `frontend/src/components/shared/Header.tsx` - Role-specific navigation
2. `frontend/src/components/ProtectedRoute.tsx` - Enhanced role guards
3. `frontend/src/pages/Login.tsx` - Update redirect paths
4. `frontend/src/pages/artisan/ArtisanDashboard.tsx` - NEW (move from pages/)
5. `frontend/src/pages/designer/DesignerDashboard.tsx` - NEW (move from pages/)
6. `frontend/src/App.tsx` - Add all role-specific routes
7. `frontend/src/pages/Dashboard.tsx` - Convert to redirect component

## Notes

- Keep all existing API connections intact
- Maintain all existing functionality
- Use established design language (amber colors, clean cards)
- Zero package.json changes
- All builds happen in Docker