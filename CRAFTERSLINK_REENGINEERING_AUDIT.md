# CraftersLink Platform Re-engineering Audit
**Date:** May 9, 2026  
**Platform:** CraftersLink - Connecting Craft with Vision  
**Scope:** Complete platform re-engineering based on comprehensive user story

---

## Executive Summary

This audit compares the existing codebase against the detailed user story requirements. The platform requires significant re-engineering across all layers while retaining most of the database structure.

**Key Findings:**
- ✅ Database schema is 80% aligned - minimal changes needed
- ⚠️ User roles need terminology update (DESIGNER → INTERIOR_DESIGNER)
- ❌ Missing Projects and Project_Items tables
- ⚠️ Backend API routing needs complete restructuring
- ❌ Frontend requires complete rebuild to match user story flows
- ⚠️ Docker configuration needs CraftersLink branding updates

---

## 1. DATABASE LAYER AUDIT

### 1.1 User Model - MOSTLY ALIGNED ✅

**Current State:**
```python
class User.UserRole(models.TextChoices):
    ARTISAN = 'ARTISAN', 'Artisan'
    DESIGNER = 'DESIGNER', 'Interior Designer'
```

**Required Change:**
```python
class User.UserRole(models.TextChoices):
    ARTISAN = 'ARTISAN', 'Artisan'
    INTERIOR_DESIGNER = 'INTERIOR_DESIGNER', 'Interior Designer'
```

**Action:** Create migration to rename DESIGNER → INTERIOR_DESIGNER

**Fields Present:**
- ✅ username, email, first_name, last_name
- ✅ role (needs value update)
- ✅ phone_number
- ✅ profile_image
- ✅ is_verified, is_active, is_staff
- ✅ timestamps

### 1.2 ArtisanProfile Model - ALIGNED ✅

**Current State:** Fully aligned with user story requirements
- ✅ bio, county, town, craft_specialty
- ✅ years_of_experience
- ✅ workshop_address, business_name
- ✅ portfolio_images (JSONField)
- ✅ average_rating, total_commissions

**Action:** No changes needed

### 1.3 DesignerProfile Model - ALIGNED ✅

**Current State:** Fully aligned
- ✅ company_name, specialisation
- ✅ bio, years_of_experience
- ✅ portfolio_images (JSONField)
- ✅ projects_completed

**Action:** No changes needed

### 1.4 Product Model - NEEDS MAPPING ⚠️

**Current State:** Called "Product" but maps to user story's "Catalogue Item"

**Mapping:**
- Product → CatalogueItem (conceptual, keep table name)
- status field needs alignment with user story availability states

**Current Status Values:**
- IN_STOCK
- COMMISSIONABLE
- SOLD
- ARCHIVED

**Required Availability Values (per user story):**
- Available
- Busy
- Custom Order

**Action:** Add migration to update status choices or create mapping layer

### 1.5 SavedItem Model - EXISTS ✅

**Current State:** Already implemented
```python
class SavedItem(models.Model):
    designer = ForeignKey(User, limit_choices_to={'role': 'DESIGNER'})
    product = ForeignKey(Product)
    saved_at = DateTimeField
```

**Action:** Update role limit to 'INTERIOR_DESIGNER' after role migration

### 1.6 Notification Model - EXISTS ✅

**Current State:** Fully implemented
- ✅ user, type, title, message
- ✅ is_read, reference_id, reference_type
- ✅ created_at

**Action:** No changes needed

### 1.7 Commission Model - EXISTS BUT NEEDS RENAMING ⚠️

**Current State:** Called "Commission" but user story calls it "Order/Enquiry"

**Conceptual Mapping:**
- Commission → Order/Enquiry
- Commission.status maps to Order status

**Action:** Keep model name but ensure API endpoints use "orders" terminology

### 1.8 MISSING: Projects Table ❌

**Required Structure:**
```python
class Project(models.Model):
    designer = ForeignKey(User, related_name='projects')
    name = CharField(max_length=200)
    description = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

**Action:** Create new model and migration

### 1.9 MISSING: ProjectItems Table ❌

**Required Structure:**
```python
class ProjectItem(models.Model):
    project = ForeignKey(Project, related_name='items')
    product = ForeignKey(Product, related_name='pinned_to_projects')
    pinned_at = DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['project', 'product']
```

**Action:** Create new model and migration

---

## 2. BACKEND API AUDIT

### 2.1 Authentication Endpoints

**Required:**
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

**Current State:** Likely exists but needs verification and role handling update

**Actions Needed:**
1. Ensure register endpoint accepts role selection
2. Ensure login returns JWT with role claim
3. Update /api/auth/me to return correct role value
4. Implement proper error messages (no raw errors)

### 2.2 Artisan-Only Endpoints - NEEDS IMPLEMENTATION ❌

**Required Routes:**
```
GET  /api/catalogue/my              # Artisan's own catalogue
POST /api/catalogue                 # Create catalogue item
PUT  /api/catalogue/:id             # Update own item
DELETE /api/catalogue/:id           # Delete own item
GET  /api/orders                    # Receive enquiries (artisan view)
PATCH /api/orders/:id/status        # Accept/Decline enquiry
GET  /api/profile/artisan           # Get own artisan profile
PUT  /api/profile/artisan           # Update own profile
```

**Critical:** `/api/catalogue/my` MUST be defined BEFORE `/api/catalogue/:artisanId`

**Actions Needed:**
1. Create dedicated artisan catalogue views
2. Implement role-based permissions on all endpoints
3. Add proper route ordering
4. Implement Accept/Decline order status updates

### 2.3 Designer-Only Endpoints - NEEDS IMPLEMENTATION ❌

**Required Routes:**
```
GET  /api/artisans                          # Browse all artisans
GET  /api/artisans/:id                      # Artisan detail
GET  /api/catalogue                         # Browse all catalogue items
GET  /api/catalogue/:artisanId              # Specific artisan's catalogue
GET  /api/catalogue/:artisanId/:itemId      # Item detail
POST /api/saved                             # Save item
GET  /api/saved                             # Get saved items
DELETE /api/saved/:itemId                   # Remove saved item
GET  /api/projects                          # List projects
POST /api/projects                          # Create project
GET  /api/projects/:id                      # Project detail
POST /api/projects/:id/items                # Pin item to project
DELETE /api/projects/:id/items/:itemId      # Unpin item
POST /api/orders                            # Send enquiry
GET  /api/orders                            # Enquiries sent (designer view)
GET  /api/search                            # Search with filters
GET  /api/profile/designer                  # Get own designer profile
PUT  /api/profile/designer                  # Update own profile
```

**Actions Needed:**
1. Implement all browse/search endpoints
2. Create nested routing for artisan → item detail
3. Implement saved items CRUD
4. Implement projects and project items CRUD
5. Add comprehensive search with filters
6. Ensure role-based access control

### 2.4 Shared Endpoints

**Required Routes:**
```
GET  /api/notifications                 # Get all notifications
PATCH /api/notifications/:id/read       # Mark as read
```

**Actions Needed:**
1. Implement notification endpoints
2. Filter by authenticated user
3. Add unread count endpoint

### 2.5 Route Ordering - CRITICAL ⚠️

**Problem:** Dynamic routes can catch static routes if not ordered correctly

**Required Order:**
```python
# Static routes FIRST
path('catalogue/my/', views.my_catalogue),  # Artisan's own

# Dynamic routes AFTER
path('catalogue/<int:artisan_id>/', views.artisan_catalogue),
path('catalogue/<int:artisan_id>/<int:item_id>/', views.item_detail),
```

**Action:** Audit and reorder all URL patterns

---

## 3. FRONTEND AUDIT

### 3.1 Branding - NEEDS UPDATE ⚠️

**Required Changes:**
- Platform name: CraftersLink (everywhere)
- Tagline: "Connecting Craft with Vision"
- Update all page titles, headers, logos
- Update landing page text references only (NOT layout)

### 3.2 Routing Structure - NEEDS COMPLETE REBUILD ❌

**Required Routes:**

**Public:**
```
/                   Landing page
/register           Registration with role selection
/login              Login
```

**Artisan Protected:**
```
/dashboard/artisan                      Dashboard
/dashboard/artisan/catalogue            My Catalogue list
/dashboard/artisan/catalogue/new        Add New Item
/dashboard/artisan/catalogue/:id        Item detail/edit
/dashboard/artisan/orders               My Orders
/dashboard/artisan/profile              My Profile
```

**Designer Protected:**
```
/dashboard/designer                                 Dashboard
/dashboard/designer/catalogue                       Browse artisans
/dashboard/designer/catalogue/:artisanId            Artisan detail
/dashboard/designer/catalogue/:artisanId/:itemId    Item detail
/dashboard/designer/saved                           Saved Items
/dashboard/designer/projects                        My Projects
/dashboard/designer/enquiries                       Enquiries Sent
/dashboard/designer/profile                         My Profile
```

**Actions Needed:**
1. Define all routes in router configuration
2. Implement role-based route guards
3. Add redirect logic for wrong role access
4. Implement unauthenticated redirect to /login

### 3.3 Registration Flow - NEEDS REBUILD ❌

**Required Flow:**
1. Show two role selection cards side-by-side
2. User clicks card → card highlights
3. Registration form appears below
4. Form fields: Full Name, Email, Phone, Password, Confirm Password
5. Password strength indicator (live)
6. Confirm password inline validation
7. On success: show message → redirect to /login (NOT dashboard)
8. On error: show user-friendly message

**Current State:** Unknown - needs verification

**Actions Needed:**
1. Build role selection card component
2. Implement form with all validations
3. Add password strength indicator
4. Ensure redirect to /login after success
5. Add proper error handling

### 3.4 Login Flow - NEEDS REBUILD ❌

**Required Flow:**
1. Show success banner if ?registered=true
2. Email and Password fields
3. Show/hide password toggle
4. On success: redirect based on role
   - ARTISAN → /dashboard/artisan
   - INTERIOR_DESIGNER → /dashboard/designer
5. On error: show "Incorrect email or password"

**Actions Needed:**
1. Build login form with toggle
2. Implement success banner logic
3. Add role-based redirect
4. Add proper error handling

### 3.5 Artisan Dashboard - NEEDS COMPLETE BUILD ❌

**Required Components:**

**Sidebar Navigation (5 items ONLY):**
- Dashboard
- My Catalogue
- My Orders
- My Profile
- Notifications (with badge)

**Dashboard Content:**
- Welcome message with name
- 4 summary cards:
  - Total Catalogue Items
  - Total Enquiries Received
  - Profile Views This Week
  - Average Rating
- Empty state prompt if new user

**Actions Needed:**
1. Build artisan-specific sidebar
2. Create dashboard with summary cards
3. Implement My Catalogue page with grid
4. Build Add/Edit item forms
5. Create My Orders page with enquiry cards
6. Implement Accept/Decline actions
7. Build My Profile page with all fields
8. Add Notifications panel

### 3.6 Designer Dashboard - NEEDS COMPLETE BUILD ❌

**Required Components:**

**Sidebar Navigation (7 items ONLY):**
- Dashboard
- Artisan Catalogue
- Saved Items
- My Projects
- Enquiries Sent
- My Profile
- Notifications (with badge)

**Dashboard Content:**
- Welcome message with name
- 4 summary cards:
  - Artisans Browsed This Week
  - Items Saved
  - Active Projects
  - Enquiries Pending Reply

**Actions Needed:**
1. Build designer-specific sidebar
2. Create dashboard with summary cards
3. Build Artisan Catalogue browse with filters
4. Create Artisan Detail page
5. Create Item Detail page with Save/Enquiry
6. Build Saved Items page
7. Create My Projects with boards
8. Build Enquiries Sent tracker
9. Build My Profile page
10. Add Notifications panel

### 3.7 Shared Components - NEEDS BUILD ❌

**Required Components:**
- Role-aware navigation sidebar
- Notification bell with unread badge
- Toast notification system
- Enquiry modal (opens over page, doesn't navigate)
- Skeleton loaders
- Empty state component
- Breadcrumb component
- Search bar with API integration
- Filter panel component

**Actions Needed:**
1. Build all shared components
2. Ensure responsive design
3. Add accessibility features
4. Implement loading/error/empty states

### 3.8 Responsiveness - NEEDS IMPLEMENTATION ❌

**Required Breakpoints:**
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Requirements:**
- Sidebar → hamburger menu on mobile
- Grids: 3 cols desktop → 2 tablet → 1 mobile
- No horizontal scroll at any breakpoint
- Touch targets minimum 44x44px on mobile
- Modals full-screen on mobile

**Actions Needed:**
1. Implement mobile-first CSS
2. Add hamburger menu
3. Test all breakpoints
4. Ensure touch-friendly UI

---

## 4. DOCKER CONFIGURATION AUDIT

### 4.1 Backend Dockerfile - NEEDS UPDATE ⚠️

**Required:**
- Multi-stage build (optional but recommended)
- HEALTHCHECK instruction
- Entrypoint script for migrations/seeding
- All dependencies from requirements.txt
- Environment variables via .env

**Actions Needed:**
1. Add HEALTHCHECK
2. Create entrypoint.sh script
3. Ensure migrations run on startup

### 4.2 Frontend Dockerfile - NEEDS UPDATE ⚠️

**Required:**
- Multi-stage build (build + nginx)
- nginx.conf with SPA catch-all
- No node_modules in final image
- API base URL via build arg

**Critical nginx.conf requirement:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

**Actions Needed:**
1. Implement multi-stage build
2. Add nginx.conf with catch-all
3. Configure build args

### 4.3 docker-compose.yml - NEEDS UPDATE ⚠️

**Required Service Names:**
- crafterslink-frontend
- crafterslink-backend
- crafterslink-db
- crafterslink-redis (if used)

**Required:**
- Shared network: crafterslink-network
- Named volume: crafterslink-db-data
- Health checks on all services
- depends_on with health check conditions
- All ports documented

**Actions Needed:**
1. Rename all services
2. Update network name
3. Update volume name
4. Add health checks
5. Document all ports

### 4.4 .env.example - NEEDS UPDATE ⚠️

**Required Variables:**
- Database credentials
- JWT secret
- API base URL
- Port numbers
- Any third-party service keys

**Actions Needed:**
1. List all required variables
2. Add inline comments
3. Provide placeholder values

---

## 5. CRITICAL ISSUES TO ADDRESS

### 5.1 Role Terminology Mismatch ⚠️

**Problem:** User story uses INTERIOR_DESIGNER, code uses DESIGNER

**Impact:** High - affects all role checks

**Solution:**
1. Create migration to update role values
2. Update all code references
3. Update frontend role checks
4. Update API responses

### 5.2 Missing Projects Feature ❌

**Problem:** Projects and ProjectItems tables don't exist

**Impact:** High - core designer feature missing

**Solution:**
1. Create Project model
2. Create ProjectItem model
3. Create migrations
4. Implement API endpoints
5. Build frontend pages

### 5.3 Route Ordering Issues ⚠️

**Problem:** Dynamic routes may catch static routes

**Impact:** High - causes 404 errors

**Solution:**
1. Audit all URL patterns
2. Reorder: static before dynamic
3. Test all routes

### 5.4 Post-Registration Flow ⚠️

**Problem:** User story requires redirect to /login, not auto-login

**Impact:** Medium - UX flow mismatch

**Solution:**
1. Remove auto-login after registration
2. Show success message
3. Redirect to /login
4. Add ?registered=true flag
5. Show banner on login page

### 5.5 Nginx SPA Catch-All Missing ❌

**Problem:** Page refresh on dynamic routes causes 404

**Impact:** High - breaks navigation

**Solution:**
1. Add nginx.conf to frontend
2. Include try_files directive
3. Test page refresh on all routes

---

## 6. IMPLEMENTATION PRIORITY

### Phase 1: Database (1-2 days)
1. Create role migration (DESIGNER → INTERIOR_DESIGNER)
2. Create Project model and migration
3. Create ProjectItem model and migration
4. Update seed data with CraftersLink branding
5. Test migrations

### Phase 2: Backend Core (2-3 days)
1. Update all branding references
2. Implement JWT auth with role claims
3. Create role-based permissions middleware
4. Fix auth endpoints
5. Update error handling

### Phase 3: Backend Artisan APIs (2-3 days)
1. Implement /api/catalogue/my
2. Fix catalogue CRUD with permissions
3. Implement /api/orders (artisan view)
4. Implement status updates
5. Add artisan profile endpoints

### Phase 4: Backend Designer APIs (3-4 days)
1. Implement /api/artisans endpoints
2. Implement /api/catalogue browse endpoints
3. Implement /api/saved CRUD
4. Implement /api/projects CRUD
5. Implement /api/search with filters
6. Add designer profile endpoints

### Phase 5: Backend Shared (1 day)
1. Implement /api/notifications
2. Fix route ordering
3. Add comprehensive error handling
4. Test all endpoints

### Phase 6: Frontend Auth & Routing (2-3 days)
1. Update branding everywhere
2. Implement role-based route guards
3. Build registration page with role selection
4. Build login page
5. Implement post-registration flow

### Phase 7: Frontend Artisan (3-4 days)
1. Build artisan sidebar
2. Build artisan dashboard
3. Build My Catalogue pages
4. Build My Orders page
5. Build My Profile page
6. Add notifications

### Phase 8: Frontend Designer (4-5 days)
1. Build designer sidebar
2. Build designer dashboard
3. Build Artisan Catalogue browse
4. Build Artisan/Item detail pages
5. Build Saved Items page
6. Build My Projects page
7. Build Enquiries Sent page
8. Build My Profile page
9. Add notifications

### Phase 9: Frontend Shared Components (2-3 days)
1. Build all shared components
2. Implement toast system
3. Add skeleton loaders
4. Create empty states
5. Build modals

### Phase 10: Responsiveness & Polish (2-3 days)
1. Implement mobile-first design
2. Add hamburger menu
3. Test all breakpoints
4. Add accessibility features
5. Polish UI/UX

### Phase 11: Docker & Deployment (1-2 days)
1. Update backend Dockerfile
2. Update frontend Dockerfile with nginx
3. Update docker-compose.yml
4. Create .env.example
5. Add entrypoint scripts
6. Test full Docker setup

### Phase 12: Testing & Documentation (2-3 days)
1. Create integration checklist
2. Write testing guide
3. Update README
4. Document all APIs
5. Create deployment guide
6. Test all user flows

**Total Estimated Time: 25-35 days**

---

## 7. SUCCESS CRITERIA

### Must Have (Non-Negotiable):
- ✅ Zero 404 errors on any route
- ✅ Role-based access control working perfectly
- ✅ Post-registration redirects to /login
- ✅ Page refresh works on all dynamic routes
- ✅ Artisan sees only artisan features
- ✅ Designer sees only designer features
- ✅ All user story flows implemented exactly
- ✅ Responsive on mobile, tablet, desktop
- ✅ Docker setup works end-to-end
- ✅ CraftersLink branding throughout

### Should Have:
- ✅ Comprehensive error handling
- ✅ Loading states everywhere
- ✅ Empty states with helpful prompts
- ✅ Toast notifications for all actions
- ✅ Accessibility (WCAG AA)
- ✅ Seed data for immediate demo

### Nice to Have:
- ✅ Skeleton loaders
- ✅ Smooth animations
- ✅ Advanced search filters
- ✅ Image optimization

---

## 8. RISK ASSESSMENT

### High Risk:
1. **Route ordering issues** - Can cause cascading 404 errors
2. **Role terminology mismatch** - Affects entire codebase
3. **Missing nginx catch-all** - Breaks SPA navigation
4. **Incomplete role-based access** - Security vulnerability

### Medium Risk:
1. **Complex nested routing** - Designer catalogue → artisan → item
2. **Projects feature missing** - Core functionality gap
3. **Post-registration flow** - UX mismatch with user story

### Low Risk:
1. **Branding updates** - Straightforward find/replace
2. **UI polish** - Can be iterative
3. **Documentation** - Can be done in parallel

---

## CONCLUSION

The existing codebase provides a solid foundation with ~80% of the database structure already in place. However, significant re-engineering is required across:

1. **Backend:** Complete API restructuring with proper role-based routing
2. **Frontend:** Complete rebuild to match user story flows exactly
3. **Docker:** Configuration updates for CraftersLink branding

The most critical tasks are:
1. Fix role terminology (DESIGNER → INTERIOR_DESIGNER)
2. Add Projects tables
3. Implement proper route ordering
4. Build role-specific dashboards
5. Add nginx SPA catch-all

With focused effort following the phased approach, the platform can be fully re-engineered in 25-35 days.

---

**Next Steps:**
1. Get stakeholder approval on this audit
2. Begin Phase 1: Database changes
3. Proceed sequentially through phases
4. Test continuously at each phase
5. Document as we build

---

*Audit completed by Bob - Senior Software Engineer*  
*Date: May 9, 2026*