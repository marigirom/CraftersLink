# CraftersLink Frontend Implementation Guide

## Overview
This document provides a comprehensive guide for the CraftersLink frontend implementation, focusing on the authentication flow and backend integration.

---

## ✅ Implementation Summary

### Completed Components

#### 1. **API Client (src/services/apiClient.ts)**
- ✅ Axios instance configured with base URL: `http://localhost:8000/api/v1`
- ✅ Request interceptor adds JWT Bearer token automatically
- ✅ Response interceptor handles 401 errors with automatic token refresh
- ✅ Error handling utilities for consistent error messages
- ✅ CORS credentials enabled

#### 2. **Authentication Service (src/services/authService.ts)**
- ✅ Register function with full backend compatibility
- ✅ Login function with JWT token management
- ✅ Logout function with token cleanup
- ✅ getCurrentUser and fetchCurrentUser methods
- ✅ Token storage in localStorage
- ✅ Role-based helper methods (isArtisan, isDesigner)

#### 3. **Type Definitions (src/types/index.ts)**
- ✅ Fixed role types to match backend: `'ARTISAN' | 'DESIGNER'` (uppercase)
- ✅ User interface matches backend serializer exactly
- ✅ RegisterData interface with all required fields
- ✅ LoginData interface for authentication

#### 4. **Registration Page (src/pages/Register.tsx)**
- ✅ Complete form with all required fields
- ✅ Client-side validation matching backend rules:
  - Username: 3-150 chars, alphanumeric + underscore
  - Email: Valid format, unique
  - Password: Min 8 chars, uppercase, lowercase, number
  - Phone: Kenyan format (+254XXXXXXXXX or 07XXXXXXXX)
- ✅ Role selection (DESIGNER/ARTISAN)
- ✅ Password confirmation validation
- ✅ Error handling with field-specific messages
- ✅ Success message and automatic redirect
- ✅ Loading states
- ✅ Tailwind CSS styling with amber theme

#### 5. **Login Page (src/pages/Login.tsx)**
- ✅ Email and password fields
- ✅ Client-side validation
- ✅ Error handling
- ✅ Remember me checkbox
- ✅ Forgot password link (placeholder)
- ✅ Guest browse option
- ✅ Loading states
- ✅ Automatic redirect based on role
- ✅ Tailwind CSS styling with amber theme

#### 6. **Home Page (src/pages/Home.tsx)**
- ✅ Hero section with CTA buttons
- ✅ Features section
- ✅ How it works section
- ✅ Role-based navigation (fixed to use uppercase roles)
- ✅ Responsive design
- ✅ Amber color scheme (artisan-focused)

---

## 🔧 Configuration Files

### Frontend Environment (.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Backend Environment (.env)
```env
DEBUG=True
SECRET_KEY=django-insecure-dev-key-change-in-production-12345678
DB_NAME=crafterslink
DB_USER=postgres
DB_PASSWORD=postgres123
DB_HOST=db
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000
```

### Docker Compose
- ✅ Frontend service on port 5173
- ✅ Backend service on port 8000
- ✅ PostgreSQL database on port 5432
- ✅ Proper networking between services
- ✅ Volume mounts for hot reload

---

## 🔗 API Endpoint Mapping

### Authentication Endpoints

| Frontend Call | Backend Endpoint | Method | Description |
|--------------|------------------|--------|-------------|
| `authService.register()` | `/api/v1/auth/register/` | POST | User registration |
| `authService.login()` | `/api/v1/auth/login/` | POST | User login |
| `authService.fetchCurrentUser()` | `/api/v1/auth/me/` | GET | Get current user |
| `authService.updateProfile()` | `/api/v1/auth/me/` | PATCH | Update profile |
| Token refresh | `/api/v1/auth/refresh/` | POST | Refresh access token |

### Request/Response Format

#### Registration Request
```json
{
  "username": "john_designer",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "DESIGNER",
  "phone_number": "+254712345678"
}
```

#### Registration Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_designer",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "DESIGNER",
      "phone_number": "+254712345678",
      "is_verified": false,
      "created_at": "2026-05-02T10:00:00Z"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  },
  "message": "User registered successfully"
}
```

#### Login Request
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Login Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "john_designer",
      "email": "john@example.com",
      "role": "DESIGNER",
      "profile_image": "https://cos.ibm.com/bucket/profile_1.jpg"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
  },
  "message": "Login successful"
}
```

---

## 🚀 Running the Application

### Prerequisites
- Docker and Docker Compose installed
- Ports 5173, 8000, and 5432 available

### Step 1: Start Services
```bash
# From project root
docker-compose up --build
```

### Step 2: Run Migrations (First Time Only)
```bash
# In a new terminal
docker-compose exec backend python manage.py migrate
```

### Step 3: Create Superuser (Optional)
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Step 4: Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/v1
- **Django Admin**: http://localhost:8000/admin

---

## 🧪 Testing the Authentication Flow

### Test Registration

1. Navigate to http://localhost:5173/register
2. Fill in the form:
   - **Role**: Select "Interior Designer" or "Artisan"
   - **Username**: `test_designer` (3-150 chars, alphanumeric + underscore)
   - **Email**: `test@example.com`
   - **First Name**: `Test`
   - **Last Name**: `User`
   - **Phone**: `+254712345678` or `0712345678` (optional)
   - **Password**: `TestPass123!` (min 8 chars, uppercase, lowercase, number)
   - **Confirm Password**: `TestPass123!`
3. Click "Create Account"
4. Should see success message and redirect to catalogue (Designer) or dashboard (Artisan)

### Test Login

1. Navigate to http://localhost:5173/login
2. Enter credentials:
   - **Email**: `test@example.com`
   - **Password**: `TestPass123!`
3. Click "Sign In"
4. Should redirect based on role

### Test Token Refresh

1. Login successfully
2. Wait for access token to expire (60 minutes by default)
3. Make an authenticated request
4. Token should automatically refresh without user intervention

---

## 🔍 Verification Checklist

### Backend Verification
- [ ] Django server running on port 8000
- [ ] Database migrations applied
- [ ] CORS configured for http://localhost:5173
- [ ] JWT authentication working
- [ ] User model with ARTISAN/DESIGNER roles

### Frontend Verification
- [ ] Vite dev server running on port 5173
- [ ] API client configured with correct base URL
- [ ] Registration form validates correctly
- [ ] Login form validates correctly
- [ ] Tokens stored in localStorage
- [ ] Authorization header added to requests
- [ ] Error messages display correctly

### Integration Verification
- [ ] Registration creates user in database
- [ ] Login returns valid JWT tokens
- [ ] Token refresh works automatically
- [ ] Role-based redirects work correctly
- [ ] CORS allows frontend-backend communication

---

## 🐛 Troubleshooting

### CORS Errors
**Problem**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**:
1. Verify `CORS_ALLOWED_ORIGINS` in backend/.env includes `http://localhost:5173`
2. Check backend settings.py has corsheaders middleware
3. Restart backend container: `docker-compose restart backend`

### 401 Unauthorized Errors
**Problem**: API returns 401 even with valid token

**Solution**:
1. Check token is stored in localStorage
2. Verify Authorization header format: `Bearer <token>`
3. Check token hasn't expired
4. Try logging out and logging in again

### Registration Validation Errors
**Problem**: Form validation fails

**Solution**:
1. Username: Must be 3-150 chars, alphanumeric + underscore only
2. Password: Must be min 8 chars with uppercase, lowercase, and number
3. Phone: Must be Kenyan format (+254XXXXXXXXX or 07XXXXXXXX)
4. Email: Must be valid email format

### Database Connection Errors
**Problem**: Backend can't connect to database

**Solution**:
1. Ensure database container is running: `docker-compose ps`
2. Check database credentials in backend/.env
3. Wait for database health check to pass
4. Restart services: `docker-compose restart`

---

## 📋 Next Steps

### Immediate Tasks
1. Test registration and login flows
2. Verify token refresh mechanism
3. Test role-based redirects
4. Check error handling for all edge cases

### Future Enhancements
1. Implement Artisan Catalogue page
2. Add Commission Flow components
3. Implement Dashboard for Artisans
4. Add Profile management
5. Implement file upload for images
6. Add IBM Cloud Object Storage integration

---

## 🎨 Design Specifications

### Color Scheme (Artisan-Focused)
- **Primary**: Amber-600 (#D97706)
- **Primary Hover**: Amber-700 (#B45309)
- **Background**: Amber-50 (#FFFBEB)
- **Accent**: Amber-100 (#FEF3C7)

### Typography
- **Headings**: Bold, Gray-900
- **Body**: Regular, Gray-700
- **Labels**: Medium, Gray-700

### Components
- **Buttons**: Rounded-lg, px-8 py-3, font-semibold
- **Inputs**: Rounded-lg, px-4 py-2, border focus:ring-2
- **Cards**: Rounded-xl, shadow-lg, hover:shadow-xl

---

## 📝 Notes

### Naming Integrity
- ✅ Backend uses uppercase roles: `ARTISAN`, `DESIGNER`
- ✅ Frontend types updated to match: `'ARTISAN' | 'DESIGNER'`
- ✅ All API field names match exactly (snake_case)
- ✅ No naming inconsistencies between frontend and backend

### Token Management
- Access tokens stored in `localStorage` as `access_token`
- Refresh tokens stored in `localStorage` as `refresh_token`
- User data stored in `localStorage` as `user` (JSON string)
- Automatic token refresh on 401 responses
- Tokens cleared on logout

### Security Considerations
- Passwords validated on both client and server
- JWT tokens used for authentication
- CORS properly configured
- HTTPS recommended for production
- Sensitive data not logged to console in production

---

## 🤝 Contributing

When making changes:
1. Maintain naming consistency with backend
2. Follow existing code patterns
3. Update this guide with any changes
4. Test authentication flow after changes
5. Ensure CORS settings remain correct

---

**Made with Bob - Senior Frontend Architect & Systems Integrator**