# DEPLOYMENT INSTRUCTIONS
## Rebuilding Containers & Applying All Changes

**Date:** 2026-05-09  
**Purpose:** Apply all new database models, API endpoints, and frontend fixes

---

## 🚨 IMPORTANT: WHAT CHANGED

### Backend Changes:
1. **3 New Database Models** - DesignerProfile, SavedItem, Notification
2. **15+ New API Endpoints** - Designer profiles, saved items, search, notifications
3. **5 New Permission Classes** - Complete RBAC system
4. **New App URLs** - Common app routes integrated

### Frontend Changes:
1. **Register Page** - Fixed auto-login issue (CRITICAL)
2. **Login Page** - Added post-registration banner
3. **ProtectedRoute** - Enhanced with role-based access control

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before rebuilding containers, ensure:
- [ ] All code changes are saved
- [ ] You have a backup of any important data
- [ ] Docker and Docker Compose are running
- [ ] You're in the project root directory: `/home/avat/Desktop/CraftersLink`

---

## 🔄 DEPLOYMENT STEPS

### Step 1: Stop Running Containers

```bash
cd /home/avat/Desktop/CraftersLink
docker-compose down
```

**What this does:** Stops all running containers gracefully

---

### Step 2: Remove Old Volumes (OPTIONAL - Only if you want fresh database)

```bash
# WARNING: This will delete all existing data!
docker-compose down -v
```

**Use this if:**
- You want to start with a completely fresh database
- You're experiencing database migration issues
- You want to test the seed data from scratch

**Skip this if:**
- You want to keep existing data
- You're just applying new migrations

---

### Step 3: Rebuild Containers

```bash
# Rebuild with no cache to ensure all changes are applied
docker-compose build --no-cache

# Or rebuild specific services
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
```

**What this does:**
- Rebuilds Docker images with all new code
- Installs any new dependencies
- Ensures clean build without cached layers

---

### Step 4: Start Containers

```bash
docker-compose up -d
```

**What this does:**
- Starts all services in detached mode
- Backend, frontend, and database

---

### Step 5: Run Database Migrations

```bash
# Create migrations for new models
docker-compose exec backend python manage.py makemigrations

# Apply migrations
docker-compose exec backend python manage.py migrate
```

**Expected Output:**
```
Migrations for 'users':
  apps/users/migrations/0002_designerprofile.py
    - Create model DesignerProfile
Migrations for 'common':
  apps/common/migrations/0001_initial.py
    - Create model SavedItem
    - Create model Notification
```

---

### Step 6: Create Superuser (Optional)

```bash
docker-compose exec backend python manage.py createsuperuser
```

**Follow prompts to create admin account for:**
- Email: your-email@example.com
- Username: admin
- Password: (your secure password)

---

### Step 7: Verify Services

```bash
# Check all containers are running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Check frontend logs
docker-compose logs frontend

# Check database logs
docker-compose logs db
```

**Expected Status:** All services should show "Up" status

---

### Step 8: Test New Endpoints

```bash
# Test health check
curl http://localhost:8000/api/v1/auth/me/

# Test new search endpoint (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/search/?q=furniture

# Test notifications endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/notifications/
```

---

## 🧪 TESTING THE CHANGES

### Test 1: Registration Flow (CRITICAL)

1. Open browser: `http://localhost:3000/register`
2. Fill in registration form
3. Select role (ARTISAN or DESIGNER)
4. Submit form
5. **VERIFY:** You are redirected to `/login?registered=true`
6. **VERIFY:** Green success banner appears: "Account created successfully!"
7. **VERIFY:** You are NOT automatically logged in

### Test 2: Login Flow

1. On login page, enter credentials
2. Submit form
3. **VERIFY ARTISAN:** Redirected to `/dashboard/artisan`
4. **VERIFY DESIGNER:** Redirected to `/dashboard/designer`

### Test 3: Role-Based Access

1. Login as ARTISAN
2. Try to access `/dashboard/designer` in browser
3. **VERIFY:** Automatically redirected to `/dashboard/artisan`
4. Repeat with DESIGNER role

### Test 4: Backend API

1. Login and get JWT token
2. Test new endpoints:
   ```bash
   # Get designer profile
   curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8000/api/v1/auth/designer/profile/
   
   # Search
   curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8000/api/v1/search/?q=test
   
   # Notifications
   curl -H "Authorization: Bearer TOKEN" \
     http://localhost:8000/api/v1/notifications/
   ```

---

## 🐛 TROUBLESHOOTING

### Issue: Migrations Fail

**Solution:**
```bash
# Check migration status
docker-compose exec backend python manage.py showmigrations

# If conflicts, try:
docker-compose exec backend python manage.py migrate --fake-initial

# Or reset migrations (WARNING: loses data)
docker-compose down -v
docker-compose up -d
docker-compose exec backend python manage.py migrate
```

### Issue: Import Errors

**Solution:**
```bash
# Rebuild without cache
docker-compose build --no-cache backend

# Check Python path
docker-compose exec backend python -c "import sys; print(sys.path)"

# Verify Django can import new models
docker-compose exec backend python manage.py shell
>>> from apps.common.models import SavedItem, Notification
>>> from apps.users.models import DesignerProfile
```

### Issue: Frontend Not Updating

**Solution:**
```bash
# Clear browser cache
# Or use incognito/private mode

# Rebuild frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend

# Check frontend logs
docker-compose logs -f frontend
```

### Issue: Database Connection Errors

**Solution:**
```bash
# Check database is running
docker-compose ps db

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db

# Verify connection
docker-compose exec backend python manage.py dbshell
```

### Issue: Port Already in Use

**Solution:**
```bash
# Find process using port 8000
sudo lsof -i :8000

# Kill process
sudo kill -9 PID

# Or change port in docker-compose.yml
```

---

## 📊 VERIFICATION CHECKLIST

After deployment, verify:

### Backend:
- [ ] All containers running (`docker-compose ps`)
- [ ] Migrations applied successfully
- [ ] No errors in backend logs
- [ ] Admin panel accessible: `http://localhost:8000/admin/`
- [ ] New models visible in admin (DesignerProfile, SavedItem, Notification)
- [ ] API endpoints responding

### Frontend:
- [ ] Frontend accessible: `http://localhost:3000/`
- [ ] Registration redirects to login (NOT auto-login)
- [ ] Login shows success banner after registration
- [ ] Login redirects to correct dashboard based on role
- [ ] Protected routes enforce role-based access

### Database:
- [ ] New tables created (designer_profiles, saved_items, notifications)
- [ ] Foreign key relationships intact
- [ ] Indexes created

---

## 🔍 QUICK VERIFICATION COMMANDS

```bash
# Check all services
docker-compose ps

# Check backend health
curl http://localhost:8000/api/v1/auth/me/

# Check frontend
curl http://localhost:3000/

# View backend logs (last 50 lines)
docker-compose logs --tail=50 backend

# View frontend logs
docker-compose logs --tail=50 frontend

# Check database tables
docker-compose exec db psql -U postgres -d crafterslink -c "\dt"

# Verify new models in Django shell
docker-compose exec backend python manage.py shell
>>> from apps.common.models import SavedItem, Notification
>>> from apps.users.models import DesignerProfile
>>> print("All models imported successfully!")
```

---

## 📝 POST-DEPLOYMENT NOTES

### What's Working:
✅ All backend API endpoints  
✅ Role-based access control  
✅ Registration → Login flow (fixed)  
✅ Role-based redirects  
✅ Search functionality (backend)  
✅ Notifications system  
✅ Saved items system  

### What's Pending:
⏳ Separate Artisan/Designer dashboard pages  
⏳ Database seed data  
⏳ Search UI component  
⏳ Complete responsive design  

### Next Steps:
1. Test all new endpoints thoroughly
2. Create role-specific dashboard pages
3. Generate seed data for testing
4. Complete remaining UI components

---

## 🆘 NEED HELP?

### Check Logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Follow logs in real-time
docker-compose logs -f backend
```

### Access Containers:
```bash
# Backend shell
docker-compose exec backend bash

# Frontend shell
docker-compose exec frontend sh

# Database shell
docker-compose exec db psql -U postgres -d crafterslink
```

### Reset Everything:
```bash
# Nuclear option - complete reset
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

---

**Deployment Guide Version:** 1.0  
**Last Updated:** 2026-05-09 00:05 UTC  
**Status:** Ready for Deployment