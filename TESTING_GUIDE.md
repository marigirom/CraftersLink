# COMPREHENSIVE TESTING GUIDE
## CraftersLink Platform - Quality Assurance Procedures

**Version:** 1.0  
**Date:** 2026-05-09  
**Status:** Ready for Testing (Backend + Core Frontend)

---

## TABLE OF CONTENTS

1. [Testing Prerequisites](#testing-prerequisites)
2. [Authentication Flow Tests](#authentication-flow-tests)
3. [Role-Based Access Control Tests](#role-based-access-control-tests)
4. [API Endpoint Tests](#api-endpoint-tests)
5. [Frontend Component Tests](#frontend-component-tests)
6. [Integration Tests](#integration-tests)
7. [Responsive Design Tests](#responsive-design-tests)
8. [Performance Tests](#performance-tests)
9. [Security Tests](#security-tests)
10. [Bug Reporting Template](#bug-reporting-template)

---

## TESTING PREREQUISITES

### Environment Setup
```bash
# 1. Ensure Docker is running
docker --version

# 2. Start all services
docker-compose up -d

# 3. Verify all services are healthy
docker-compose ps

# 4. Check backend is accessible
curl http://localhost:8000/api/v1/health/

# 5. Check frontend is accessible
curl http://localhost:3000/
```

### Test User Accounts

Create these test accounts for testing:

**Artisan Account:**
- Email: `artisan.test@crafterslink.com`
- Password: `TestPass123!`
- Role: Artisan
- Name: Test Artisan

**Designer Account:**
- Email: `designer.test@crafterslink.com`
- Password: `TestPass123!`
- Role: Interior Designer
- Name: Test Designer

### Testing Tools
- **Browser:** Chrome/Firefox with DevTools
- **API Testing:** curl, Postman, or HTTPie
- **Mobile Testing:** Chrome DevTools Device Mode
- **Network Testing:** Chrome DevTools Network tab

---

## AUTHENTICATION FLOW TESTS

### TEST 1.1: User Registration - Artisan ✅ READY

**Objective:** Verify artisan can register and is redirected to login

**Steps:**
1. Navigate to `http://localhost:3000/register`
2. Fill in registration form:
   - Full Name: "Test Artisan User"
   - Email: "artisan.new@test.com"
   - Phone: "+254712345678"
   - Password: "SecurePass123!"
   - Confirm Password: "SecurePass123!"
   - Role: Select "Artisan"
3. Click "Register" button
4. Observe the redirect

**Expected Results:**
- ✅ Form validates all fields
- ✅ No validation errors shown
- ✅ Loading state shown during submission
- ✅ Redirects to `/login?registered=true`
- ✅ User is NOT automatically logged in
- ✅ No errors in browser console

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 1.2: User Registration - Designer ✅ READY

**Objective:** Verify designer can register with correct role

**Steps:**
1. Navigate to `http://localhost:3000/register`
2. Fill in registration form with designer role selected
3. Submit form

**Expected Results:**
- ✅ Role selection works correctly
- ✅ Designer role is saved in database
- ✅ Redirects to login page
- ✅ Success banner appears on login page

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 1.3: Post-Registration Success Banner ✅ READY

**Objective:** Verify success banner appears after registration

**Steps:**
1. Complete registration (from TEST 1.1 or 1.2)
2. Observe login page after redirect

**Expected Results:**
- ✅ Green success banner visible at top of page
- ✅ Message reads: "Account created successfully. Please log in."
- ✅ Banner only appears when URL contains `?registered=true`
- ✅ Banner does not appear on normal login page visits

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 1.4: Login - Artisan ✅ READY

**Objective:** Verify artisan can login and is redirected to artisan dashboard

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter credentials:
   - Email: `artisan.test@crafterslink.com`
   - Password: `TestPass123!`
3. Click "Login" button

**Expected Results:**
- ✅ Loading state shown during login
- ✅ Redirects to `/dashboard/artisan`
- ✅ Token stored in localStorage
- ✅ User object stored in context
- ✅ Navigation shows artisan menu items only
- ✅ No errors in console

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 1.5: Login - Designer ✅ READY

**Objective:** Verify designer can login and is redirected to designer dashboard

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Enter designer credentials
3. Click "Login" button

**Expected Results:**
- ✅ Redirects to `/dashboard/designer`
- ✅ Designer menu items visible
- ✅ Token stored correctly
- ✅ No errors

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 1.6: Login - Invalid Credentials

**Objective:** Verify proper error handling for invalid credentials

**Steps:**
1. Navigate to login page
2. Enter invalid credentials
3. Submit form

**Expected Results:**
- ✅ Error message displayed: "Invalid email or password"
- ✅ No redirect occurs
- ✅ Form remains filled (except password)
- ✅ User can retry login

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 1.7: Logout

**Objective:** Verify user can logout successfully

**Steps:**
1. Login as any user
2. Click logout button
3. Observe behavior

**Expected Results:**
- ✅ Token removed from localStorage
- ✅ User context cleared
- ✅ Redirects to login page
- ✅ Cannot access protected routes after logout

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

## ROLE-BASED ACCESS CONTROL TESTS

### TEST 2.1: Artisan Accessing Designer Routes ✅ READY

**Objective:** Verify artisan cannot access designer-only routes

**Steps:**
1. Login as artisan
2. Manually navigate to `http://localhost:3000/dashboard/designer`
3. Observe behavior

**Expected Results:**
- ✅ Automatically redirected to `/dashboard/artisan`
- ✅ Toast notification shown: "Access denied. Redirecting to your dashboard."
- ✅ No 404 error
- ✅ No console errors

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 2.2: Designer Accessing Artisan Routes ✅ READY

**Objective:** Verify designer cannot access artisan-only routes

**Steps:**
1. Login as designer
2. Manually navigate to `http://localhost:3000/dashboard/artisan`
3. Observe behavior

**Expected Results:**
- ✅ Automatically redirected to `/dashboard/designer`
- ✅ Toast notification shown
- ✅ No errors

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 2.3: Unauthenticated Access to Protected Routes

**Objective:** Verify unauthenticated users cannot access protected routes

**Steps:**
1. Logout or clear localStorage
2. Navigate to `http://localhost:3000/dashboard/artisan`
3. Observe behavior

**Expected Results:**
- ✅ Redirected to `/login`
- ✅ After login, redirected back to originally requested page
- ✅ No errors

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 2.4: Token Expiration Handling

**Objective:** Verify proper handling of expired tokens

**Steps:**
1. Login as any user
2. Manually expire token (or wait for expiration)
3. Try to access protected route

**Expected Results:**
- ✅ Automatically redirected to login
- ✅ Error message shown
- ✅ Can login again successfully

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

## API ENDPOINT TESTS

### Setup: Get Authentication Token

```bash
# Login and extract token
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "artisan.test@crafterslink.com",
    "password": "TestPass123!"
  }' | jq -r '.access')

echo $TOKEN
```

---

### TEST 3.1: Designer Profile Endpoint ✅ READY

**Objective:** Verify designer can manage their profile

**Test 3.1a: Get Designer Profile**
```bash
curl -X GET http://localhost:8000/api/v1/auth/designer/profile/ \
  -H "Authorization: Bearer $DESIGNER_TOKEN"
```

**Expected Results:**
- ✅ Returns 200 OK
- ✅ Returns designer profile data
- ✅ Includes: company_name, specialisation, projects_completed, portfolio_images

**Test 3.1b: Update Designer Profile**
```bash
curl -X PUT http://localhost:8000/api/v1/auth/designer/profile/ \
  -H "Authorization: Bearer $DESIGNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Updated Design Co",
    "specialisation": "residential",
    "projects_completed": 15
  }'
```

**Expected Results:**
- ✅ Returns 200 OK
- ✅ Profile updated in database
- ✅ Returns updated profile data

**Test 3.1c: Artisan Cannot Access Designer Profile**
```bash
curl -X GET http://localhost:8000/api/v1/auth/designer/profile/ \
  -H "Authorization: Bearer $ARTISAN_TOKEN"
```

**Expected Results:**
- ✅ Returns 403 Forbidden
- ✅ Error message indicates insufficient permissions

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 3.2: Saved Items Endpoint ✅ READY

**Objective:** Verify designers can save catalogue items

**Test 3.2a: Save an Item**
```bash
curl -X POST http://localhost:8000/api/v1/saved/ \
  -H "Authorization: Bearer $DESIGNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"catalogue_item": 1}'
```

**Expected Results:**
- ✅ Returns 201 Created
- ✅ Item saved to database
- ✅ Returns saved item data with ID

**Test 3.2b: Get Saved Items**
```bash
curl -X GET http://localhost:8000/api/v1/saved/ \
  -H "Authorization: Bearer $DESIGNER_TOKEN"
```

**Expected Results:**
- ✅ Returns 200 OK
- ✅ Returns list of saved items
- ✅ Includes catalogue item details

**Test 3.2c: Delete Saved Item**
```bash
curl -X DELETE http://localhost:8000/api/v1/saved/1/ \
  -H "Authorization: Bearer $DESIGNER_TOKEN"
```

**Expected Results:**
- ✅ Returns 204 No Content
- ✅ Item removed from database

**Test 3.2d: Artisan Cannot Save Items**
```bash
curl -X POST http://localhost:8000/api/v1/saved/ \
  -H "Authorization: Bearer $ARTISAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"catalogue_item": 1}'
```

**Expected Results:**
- ✅ Returns 403 Forbidden

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 3.3: Search Endpoint ✅ READY

**Objective:** Verify role-aware search functionality

**Test 3.3a: Designer Search (All Results)**
```bash
curl -X GET "http://localhost:8000/api/v1/search/?q=furniture&category=furniture" \
  -H "Authorization: Bearer $DESIGNER_TOKEN"
```

**Expected Results:**
- ✅ Returns 200 OK
- ✅ Returns all matching artisans and catalogue items
- ✅ Results include items from multiple artisans

**Test 3.3b: Artisan Search (Own Items Only)**
```bash
curl -X GET "http://localhost:8000/api/v1/search/?q=table" \
  -H "Authorization: Bearer $ARTISAN_TOKEN"
```

**Expected Results:**
- ✅ Returns 200 OK
- ✅ Returns only artisan's own catalogue items
- ✅ Does not include other artisans' items

**Test 3.3c: Search with Filters**
```bash
curl -X GET "http://localhost:8000/api/v1/search/?q=furniture&category=furniture&min_price=10000&max_price=50000&location=Nairobi" \
  -H "Authorization: Bearer $DESIGNER_TOKEN"
```

**Expected Results:**
- ✅ Returns filtered results
- ✅ All results match filter criteria
- ✅ Price range respected
- ✅ Location filter applied

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 3.4: Notifications Endpoint ✅ READY

**Objective:** Verify notifications system

**Test 3.4a: Get Notifications**
```bash
curl -X GET http://localhost:8000/api/v1/notifications/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Results:**
- ✅ Returns 200 OK
- ✅ Returns user's notifications
- ✅ Includes unread count
- ✅ Ordered by created_at (newest first)

**Test 3.4b: Mark Notification as Read**
```bash
curl -X PATCH http://localhost:8000/api/v1/notifications/1/mark_read/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Results:**
- ✅ Returns 200 OK
- ✅ Notification marked as read
- ✅ is_read field updated to true

**Test 3.4c: Get Unread Count**
```bash
curl -X GET http://localhost:8000/api/v1/notifications/unread_count/ \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Results:**
- ✅ Returns 200 OK
- ✅ Returns correct unread count
- ✅ Count decreases after marking as read

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 3.5: Catalogue Endpoints

**Test 3.5a: Get All Catalogues (Designer)**
```bash
curl -X GET http://localhost:8000/api/v1/catalogue/ \
  -H "Authorization: Bearer $DESIGNER_TOKEN"
```

**Expected Results:**
- ✅ Returns 200 OK
- ✅ Returns all catalogue items from all artisans

**Test 3.5b: Get My Catalogue (Artisan)**
```bash
curl -X GET http://localhost:8000/api/v1/catalogue/my/ \
  -H "Authorization: Bearer $ARTISAN_TOKEN"
```

**Expected Results:**
- ✅ Returns 200 OK
- ✅ Returns only artisan's own items

**Test 3.5c: Create Catalogue Item (Artisan)**
```bash
curl -X POST http://localhost:8000/api/v1/catalogue/ \
  -H "Authorization: Bearer $ARTISAN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Custom Dining Table",
    "description": "Handcrafted solid wood table",
    "category": "furniture",
    "price": 45000,
    "price_unit": "per_piece",
    "availability": "available"
  }'
```

**Expected Results:**
- ✅ Returns 201 Created
- ✅ Item created in database
- ✅ Returns created item with ID

**Test 3.5d: Designer Cannot Create Items**
```bash
curl -X POST http://localhost:8000/api/v1/catalogue/ \
  -H "Authorization: Bearer $DESIGNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Expected Results:**
- ✅ Returns 403 Forbidden

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

## FRONTEND COMPONENT TESTS

### TEST 4.1: Registration Form Validation

**Objective:** Verify all form validations work correctly

**Test Cases:**
1. **Empty Fields**
   - Leave all fields empty
   - Click Register
   - ✅ Validation errors shown for all required fields

2. **Invalid Email**
   - Enter "notanemail"
   - ✅ Error: "Please enter a valid email address"

3. **Password Mismatch**
   - Password: "Pass123!"
   - Confirm: "Pass456!"
   - ✅ Error: "Passwords do not match"

4. **Weak Password**
   - Enter "123"
   - ✅ Error: "Password must be at least 8 characters"

5. **Invalid Phone**
   - Enter "123"
   - ✅ Error: "Please enter a valid phone number"

6. **No Role Selected**
   - Fill all fields but don't select role
   - ✅ Error: "Please select a role"

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 4.2: Login Form Validation

**Test Cases:**
1. **Empty Fields**
   - ✅ Validation errors shown

2. **Invalid Email Format**
   - ✅ Email validation error

3. **Show/Hide Password**
   - Click eye icon
   - ✅ Password visibility toggles

4. **Remember Me** (if implemented)
   - ✅ Checkbox works correctly

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 4.3: Navigation Menu

**Objective:** Verify role-specific navigation

**Test 4.3a: Artisan Navigation**
- Login as artisan
- Check navigation menu

**Expected Menu Items:**
- ✅ Dashboard
- ✅ My Catalogue
- ✅ Orders
- ✅ Profile
- ✅ Notifications
- ❌ Browse Catalogue (should NOT appear)
- ❌ Saved Items (should NOT appear)

**Test 4.3b: Designer Navigation**
- Login as designer
- Check navigation menu

**Expected Menu Items:**
- ✅ Dashboard
- ✅ Browse Catalogue
- ✅ Saved Items
- ✅ Projects
- ✅ Enquiries
- ✅ Profile
- ✅ Notifications
- ❌ My Catalogue (should NOT appear)

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

## INTEGRATION TESTS

### TEST 5.1: Complete Artisan Journey

**Objective:** Test full artisan workflow

**Steps:**
1. Register as artisan
2. Login
3. Complete profile
4. Add catalogue item
5. View orders
6. Check notifications
7. Logout

**Expected Results:**
- ✅ All steps complete without errors
- ✅ Data persists correctly
- ✅ UI updates reflect backend changes
- ✅ No console errors throughout journey

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 5.2: Complete Designer Journey

**Objective:** Test full designer workflow

**Steps:**
1. Register as designer
2. Login
3. Browse catalogue
4. Save items
5. Create project (when implemented)
6. Send enquiry
7. Check notifications
8. Logout

**Expected Results:**
- ✅ All steps complete without errors
- ✅ Artisan receives notification
- ✅ Data persists correctly

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 5.3: Cross-Role Interaction

**Objective:** Test interaction between roles

**Steps:**
1. Artisan creates catalogue item
2. Designer searches and finds item
3. Designer saves item
4. Designer sends enquiry
5. Artisan receives notification
6. Artisan responds to enquiry

**Expected Results:**
- ✅ All interactions work correctly
- ✅ Notifications sent properly
- ✅ Data synchronized between roles

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

## RESPONSIVE DESIGN TESTS

### TEST 6.1: Mobile (320px - 767px)

**Devices to Test:**
- iPhone SE (375px)
- iPhone 12 (390px)
- Samsung Galaxy S20 (360px)

**Test Cases:**
1. **Registration Page**
   - ✅ No horizontal scrolling
   - ✅ All text readable
   - ✅ Form fields full width
   - ✅ Buttons at least 44x44px
   - ✅ Role selection easy to tap

2. **Login Page**
   - ✅ Form usable
   - ✅ Success banner visible
   - ✅ No layout issues

3. **Dashboard** (when implemented)
   - ✅ Navigation collapses to hamburger
   - ✅ Cards stack vertically
   - ✅ All features accessible

4. **Catalogue** (when implemented)
   - ✅ Grid becomes single column
   - ✅ Filters accessible
   - ✅ Images scale correctly

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 6.2: Tablet (768px - 1023px)

**Devices to Test:**
- iPad (768px)
- iPad Pro (1024px)

**Test Cases:**
1. **Layout Adjustments**
   - ✅ 3-column grid becomes 2-column
   - ✅ Sidebar remains visible or collapses gracefully
   - ✅ All features accessible

2. **Touch Interactions**
   - ✅ All buttons tappable
   - ✅ Dropdowns work correctly
   - ✅ Modals display properly

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 6.3: Desktop (1024px+)

**Resolutions to Test:**
- 1920x1080 (Full HD)
- 2560x1440 (2K)
- 3840x2160 (4K)

**Test Cases:**
1. **Layout**
   - ✅ Full layout displayed
   - ✅ No excessive whitespace
   - ✅ Content centered or properly aligned
   - ✅ Sidebar always visible

2. **Interactions**
   - ✅ Hover states work
   - ✅ Keyboard navigation works
   - ✅ All features accessible

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

## PERFORMANCE TESTS

### TEST 7.1: Page Load Times

**Objective:** Verify acceptable load times

**Test Cases:**
1. **Landing Page**
   - Target: < 2 seconds
   - Actual: ___________

2. **Login Page**
   - Target: < 1 second
   - Actual: ___________

3. **Dashboard**
   - Target: < 3 seconds
   - Actual: ___________

4. **Catalogue Browse**
   - Target: < 3 seconds
   - Actual: ___________

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 7.2: API Response Times

**Objective:** Verify API performance

```bash
# Test with time command
time curl -X GET http://localhost:8000/api/v1/catalogue/ \
  -H "Authorization: Bearer $TOKEN"
```

**Target Response Times:**
- GET requests: < 500ms
- POST requests: < 1000ms
- Search requests: < 1000ms

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

## SECURITY TESTS

### TEST 8.1: SQL Injection

**Objective:** Verify protection against SQL injection

**Test Cases:**
```bash
# Try SQL injection in search
curl -X GET "http://localhost:8000/api/v1/search/?q='; DROP TABLE users; --" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Results:**
- ✅ Query handled safely
- ✅ No database error
- ✅ No data loss

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 8.2: XSS Protection

**Objective:** Verify protection against XSS attacks

**Test Cases:**
1. Try entering `<script>alert('XSS')</script>` in form fields
2. Submit form
3. View data on page

**Expected Results:**
- ✅ Script not executed
- ✅ Content properly escaped
- ✅ No alert shown

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

### TEST 8.3: CSRF Protection

**Objective:** Verify CSRF token validation

**Test Cases:**
1. Try POST request without CSRF token
2. Try POST request with invalid token

**Expected Results:**
- ✅ Request rejected
- ✅ 403 Forbidden returned

**Pass/Fail:** ___________  
**Notes:** ___________________________________________

---

## BUG REPORTING TEMPLATE

When you find a bug, use this template:

```markdown
### Bug Report #___

**Title:** [Short description]

**Severity:** Critical / High / Medium / Low

**Environment:**
- Browser: [Chrome 120 / Firefox 121 / etc.]
- Device: [Desktop / Mobile / Tablet]
- OS: [Windows 11 / macOS 14 / etc.]
- Screen Size: [1920x1080 / 375x667 / etc.]

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[Attach screenshots if applicable]

**Console Errors:**
```
[Paste any console errors]
```

**Additional Context:**
[Any other relevant information]
```

---

## TEST RESULTS SUMMARY

### Overall Results

| Test Suite | Total Tests | Passed | Failed | Skipped |
|------------|-------------|--------|--------|---------|
| Authentication | 7 | ___ | ___ | ___ |
| RBAC | 4 | ___ | ___ | ___ |
| API Endpoints | 15 | ___ | ___ | ___ |
| Frontend Components | 3 | ___ | ___ | ___ |
| Integration | 3 | ___ | ___ | ___ |
| Responsive Design | 3 | ___ | ___ | ___ |
| Performance | 2 | ___ | ___ | ___ |
| Security | 3 | ___ | ___ | ___ |
| **TOTAL** | **40** | ___ | ___ | ___ |

### Pass Rate: ____%

### Critical Issues Found: ___

### Recommendations:
1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

---

**Tested By:** ___________  
**Date:** ___________  
**Sign-off:** ___________