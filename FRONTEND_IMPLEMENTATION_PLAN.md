# FRONTEND IMPLEMENTATION PLAN

**Platform:** CraftersLink Frontend  
**Status:** Ready to Implement  
**Priority:** HIGH - Multiple user-facing pages missing

---

## IMPLEMENTATION STRATEGY

Given the scope, I'll implement pages in order of criticality:

### Phase 1: Profile Management (CRITICAL)
- Artisan Profile Page
- Designer Profile Page

### Phase 2: Order/Enquiry Management (CRITICAL)
- My Orders (Artisan)
- Enquiries Sent (Designer)

### Phase 3: Saved Items & Projects (HIGH)
- Saved Items (Designer)
- My Projects List (Designer)
- Project Board Detail (Designer)

### Phase 4: Notifications & Polish (MEDIUM)
- Notifications Panel Component
- Update App.tsx with all routes
- Add missing navigation items

---

## MISSING PAGES DETAILED

### 1. Artisan Profile Page
**Route:** `/dashboard/artisan/profile`  
**File:** `frontend/src/pages/artisan/ArtisanProfile.tsx`

**Features:**
- Load existing profile data on mount
- Editable form fields:
  - Profile photo upload with preview
  - Bio (textarea, min 50 chars)
  - County (dropdown)
  - Town (text)
  - Craft specialty (dropdown)
  - Years of experience (number)
  - Business name (text)
  - Business registration (text, optional)
  - Portfolio images (multi-upload with thumbnails)
- Save button with loading state
- Success toast on save
- API: `GET /api/v1/artisans/:id/` and `PUT /api/v1/artisans/:id/`

### 2. Designer Profile Page
**Route:** `/dashboard/designer/profile`  
**File:** `frontend/src/pages/designer/DesignerProfile.tsx`

**Features:**
- Load existing profile data
- Editable form fields:
  - Profile photo upload
  - Company name
  - Specialisation (dropdown: Residential, Commercial, Hospitality, etc.)
  - Bio (textarea)
  - Years of experience
  - Projects completed
  - Portfolio images
- Save button with loading
- Success toast
- API: `GET /api/v1/auth/designer/profile/` and `PUT /api/v1/auth/designer/profile/`

### 3. My Orders (Artisan)
**Route:** `/dashboard/artisan/orders`  
**File:** `frontend/src/pages/artisan/MyOrders.tsx`

**Features:**
- Load all incoming commissions
- Display as cards showing:
  - Designer name and photo
  - Product/item enquired about
  - Message preview
  - Status badge (Pending/Accepted/Declined/Completed)
  - Date received
- Click card opens detail modal with:
  - Full message
  - Product details
  - Designer profile
  - Accept/Decline buttons (for Pending only)
- Accept action: Opens modal for agreed delivery date
- Decline action: Confirmation prompt
- Empty state: "No orders yet"
- API: `GET /api/v1/commissions/` and `POST /api/v1/commissions/:id/action/`

### 4. Enquiries Sent (Designer)
**Route:** `/dashboard/designer/enquiries`  
**File:** `frontend/src/pages/designer/EnquiriesSent.tsx`

**Features:**
- Load all sent commissions
- Display as cards showing:
  - Artisan name and photo
  - Product enquired about
  - Message preview
  - Status badge
  - Date sent
- Click card opens detail modal
- Empty state: "You haven't sent any enquiries yet"
- API: `GET /api/v1/commissions/`

### 5. Saved Items (Designer)
**Route:** `/dashboard/designer/saved`  
**File:** `frontend/src/pages/designer/SavedItems.tsx`

**Features:**
- Load all saved items
- Display as grid of product cards
- Each card shows:
  - Product image
  - Title
  - Price
  - Artisan name
  - Availability badge
- Click card → navigate to item detail page
- "Remove from Saved" button on each card
- Confirmation prompt before removing
- Empty state with illustration
- API: `GET /api/v1/saved/` and `DELETE /api/v1/saved/:id/`

### 6. My Projects (Designer)
**Route:** `/dashboard/designer/projects`  
**File:** `frontend/src/pages/designer/MyProjects.tsx`

**Features:**
- Load all projects
- Display as grid of project cards
- Each card shows:
  - Project name
  - Number of pinned items
  - Last updated date
- "New Project" button opens modal
- Modal fields: Project name, Description
- Click project card → navigate to project board
- Empty state
- API: `GET /api/v1/projects/` and `POST /api/v1/projects/`

### 7. Project Board Detail
**Route:** `/dashboard/designer/projects/:id`  
**File:** `frontend/src/pages/designer/ProjectBoard.tsx`

**Features:**
- Load project details and items
- Display project name as heading
- Grid of pinned item cards
- Each card shows product image, title, artisan, price
- "Add Items" button opens search modal
- Search modal: Search products, click to pin
- "Remove" button on each pinned item
- Empty state: "No items pinned yet"
- API: `GET /api/v1/projects/:id/`, `POST /api/v1/projects/:id/items/`, `DELETE /api/v1/projects/:id/items/:itemId/`

### 8. Notifications Panel
**Component:** `frontend/src/components/shared/NotificationPanel.tsx`

**Features:**
- Slide-in panel from right
- Bell icon in sidebar with unread count badge
- List of notifications
- Each notification shows:
  - Icon based on type
  - Title
  - Message
  - Time ago
  - Read/unread visual distinction
- Click notification → navigate to relevant page
- "Mark all as read" button
- API: `GET /api/v1/notifications/` and `PATCH /api/v1/notifications/:id/read/`

---

## ROUTE UPDATES NEEDED

### App.tsx Routes to Add:

```typescript
// Artisan routes
<Route path="/dashboard/artisan/profile" element={
  <ProtectedRoute allowedRoles={['ARTISAN']}>
    <ArtisanProfile />
  </ProtectedRoute>
} />
<Route path="/dashboard/artisan/catalogue/:id" element={
  <ProtectedRoute allowedRoles={['ARTISAN']}>
    <CatalogueItemForm />
  </ProtectedRoute>
} />
<Route path="/dashboard/artisan/orders" element={
  <ProtectedRoute allowedRoles={['ARTISAN']}>
    <MyOrders />
  </ProtectedRoute>
} />

// Designer routes
<Route path="/dashboard/designer/profile" element={
  <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER']}>
    <DesignerProfile />
  </ProtectedRoute>
} />
<Route path="/dashboard/designer/saved" element={
  <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER']}>
    <SavedItems />
  </ProtectedRoute>
} />
<Route path="/dashboard/designer/projects" element={
  <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER']}>
    <MyProjects />
  </ProtectedRoute>
} />
<Route path="/dashboard/designer/projects/:id" element={
  <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER']}>
    <ProjectBoard />
  </ProtectedRoute>
} />
<Route path="/dashboard/designer/enquiries" element={
  <ProtectedRoute allowedRoles={['INTERIOR_DESIGNER']}>
    <EnquiriesSent />
  </ProtectedRoute>
} />
```

---

## SHARED COMPONENTS TO CREATE

### 1. ProfileImageUpload Component
**File:** `frontend/src/components/shared/ProfileImageUpload.tsx`
- Image preview
- Upload button
- Remove button
- File validation
- Loading state

### 2. PortfolioImageUpload Component
**File:** `frontend/src/components/shared/PortfolioImageUpload.tsx`
- Multiple image upload
- Thumbnail grid
- Remove individual images
- Drag and drop support
- Max 10 images

### 3. OrderCard Component
**File:** `frontend/src/components/shared/OrderCard.tsx`
- Reusable for both artisan and designer views
- Props: order data, onClick handler
- Status badge
- Formatted date

### 4. ProjectCard Component
**File:** `frontend/src/components/shared/ProjectCard.tsx`
- Project name
- Item count
- Last updated
- Click handler

### 5. EmptyState Component
**File:** `frontend/src/components/shared/EmptyState.tsx`
- Icon/illustration
- Message
- Optional action button
- Reusable across pages

---

## API SERVICE UPDATES

### Add to `frontend/src/services/api.ts`:

```typescript
// Profile endpoints
export const getArtisanProfile = (id: number) => 
  api.get(`/artisans/${id}/`);

export const updateArtisanProfile = (id: number, data: any) => 
  api.put(`/artisans/${id}/`, data);

export const getDesignerProfile = () => 
  api.get('/auth/designer/profile/');

export const updateDesignerProfile = (data: any) => 
  api.put('/auth/designer/profile/', data);

// Orders/Commissions
export const getCommissions = () => 
  api.get('/commissions/');

export const updateCommissionStatus = (id: number, action: string, data?: any) => 
  api.post(`/commissions/${id}/action/`, { action, ...data });

// Saved items
export const getSavedItems = () => 
  api.get('/saved/');

export const removeSavedItem = (id: number) => 
  api.delete(`/saved/${id}/`);

// Projects
export const getProjects = () => 
  api.get('/projects/');

export const createProject = (data: any) => 
  api.post('/projects/', data);

export const getProject = (id: number) => 
  api.get(`/projects/${id}/`);

export const addProjectItem = (projectId: number, productId: number) => 
  api.post(`/projects/${projectId}/items/`, { product_id: productId });

export const removeProjectItem = (projectId: number, itemId: number) => 
  api.delete(`/projects/${projectId}/items/${itemId}/`);

// Notifications
export const getNotifications = () => 
  api.get('/notifications/');

export const markNotificationRead = (id: number) => 
  api.patch(`/notifications/${id}/read/`);

export const markAllNotificationsRead = () => 
  api.put('/notifications/read-all/');

// Dashboard stats
export const getArtisanStats = () => 
  api.get('/dashboard/artisan/stats/');

export const getDesignerStats = () => 
  api.get('/dashboard/designer/stats/');
```

---

## IMPLEMENTATION ORDER

1. ✅ Backend APIs (COMPLETE)
2. ⏳ Update API service layer
3. ⏳ Create shared components
4. ⏳ Implement Artisan Profile page
5. ⏳ Implement Designer Profile page
6. ⏳ Implement My Orders (Artisan)
7. ⏳ Implement Enquiries Sent (Designer)
8. ⏳ Implement Saved Items (Designer)
9. ⏳ Implement My Projects (Designer)
10. ⏳ Implement Project Board (Designer)
11. ⏳ Create Notifications Panel
12. ⏳ Update App.tsx with all routes
13. ⏳ Update dashboard components to fetch real stats
14. ⏳ Test all flows

---

## ESTIMATED TIME

- API service updates: 30 minutes
- Shared components: 1 hour
- Profile pages (2): 2 hours
- Order/Enquiry pages (2): 2 hours
- Saved Items & Projects (3): 3 hours
- Notifications: 1 hour
- Route updates & testing: 1 hour

**Total: ~10-11 hours**

---

## SUCCESS CRITERIA

- ✅ All 8 missing pages implemented
- ✅ All routes defined in App.tsx
- ✅ All pages load real data from API
- ✅ All forms submit successfully
- ✅ All empty states display correctly
- ✅ All loading states work
- ✅ All error states handled
- ✅ Responsive on mobile, tablet, desktop
- ✅ No console errors
- ✅ No broken images
- ✅ Navigation works correctly

---

**Ready to implement!** 🚀
