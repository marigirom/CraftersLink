# RESTART CONTAINERS GUIDE
## Apply All Changes Without Stopping Services

**Quick Reference:** Restart containers to apply all new code changes

---

## 🚀 QUICK RESTART (3 Commands)

```bash
# 1. Rebuild containers with new code
sudo docker-compose build

# 2. Restart all services
sudo docker-compose restart

# 3. Apply migrations and seed data
sudo docker-compose exec backend python manage.py makemigrations
sudo docker-compose exec backend python manage.py migrate
sudo docker-compose exec backend python manage.py seed_data
```

**That's it! All changes applied without downtime.**

---

## 📋 DETAILED STEPS

### Step 1: Rebuild Containers
```bash
sudo docker-compose build
```

**What this does:**
- Rebuilds backend container with new Python code
- Rebuilds frontend container with new React components
- Keeps database data intact
- No downtime during build

**Expected output:**
```
Building backend...
Building frontend...
Successfully built...
```

---

### Step 2: Restart Services
```bash
sudo docker-compose restart
```

**What this does:**
- Restarts backend service (picks up new code)
- Restarts frontend service (picks up new components)
- Restarts database (no changes, just restart)
- Services come back online in seconds

**Expected output:**
```
Restarting crafterslink_backend_1 ... done
Restarting crafterslink_frontend_1 ... done
Restarting crafterslink_db_1 ... done
```

---

### Step 3: Apply Migrations
```bash
sudo docker-compose exec backend python manage.py makemigrations
```

**Expected output:**
```
Migrations for 'users':
  backend/apps/users/migrations/0002_designerprofile.py
    - Create model DesignerProfile
Migrations for 'common':
  backend/apps/common/migrations/0001_initial.py
    - Create model SavedItem
    - Create model Notification
```

---

### Step 4: Run Migrations
```bash
sudo docker-compose exec backend python manage.py migrate
```

**Expected output:**
```
Running migrations:
  Applying users.0002_designerprofile... OK
  Applying common.0001_initial... OK
```

---

### Step 5: Seed Database
```bash
sudo docker-compose exec backend python manage.py seed_data
```

**Expected output:**
```
Starting database seeding...
Created 5 artisans
Created 3 designers
Created 16 catalogue items
Created 5 commissions
Created 15 saved items
Created 12 notifications

✅ Database seeding completed successfully!

Test Accounts Created:
Artisans:
  - john.kamau@crafterslink.com / password123
  - mary.wanjiku@crafterslink.com / password123
  - peter.omondi@crafterslink.com / password123
  - grace.akinyi@crafterslink.com / password123
  - david.mwangi@crafterslink.com / password123

Designers:
  - sarah.njeri@crafterslink.com / password123
  - james.otieno@crafterslink.com / password123
  - lucy.wambui@crafterslink.com / password123
```

---

## ✅ VERIFY EVERYTHING WORKS

### Check Services Status
```bash
sudo docker-compose ps
```

**Expected:** All services should show "Up" status

### Check Backend Logs
```bash
sudo docker-compose logs backend | tail -20
```

**Look for:** No errors, server running on port 8000

### Check Frontend Logs
```bash
sudo docker-compose logs frontend | tail -20
```

**Look for:** No errors, nginx serving on port 80

### Test Backend API
```bash
curl http://localhost:8000/api/v1/health/
```

**Expected:** `{"status": "ok"}` or similar

### Test Frontend
```bash
curl http://localhost:3000/
```

**Expected:** HTML content returned

---

## 🧪 TEST THE NEW FEATURES

### Test 1: Artisan Login
1. Open browser: `http://localhost:3000/login`
2. Login: `john.kamau@crafterslink.com` / `password123`
3. **Verify:** Redirects to `/dashboard/artisan`
4. **Verify:** See "Welcome back, John Kamau!"
5. **Verify:** See only John's catalogue items (4 items)
6. **Verify:** See stats: Total Items, Active Orders, Views

### Test 2: Designer Login
1. Logout (or use incognito)
2. Login: `sarah.njeri@crafterslink.com` / `password123`
3. **Verify:** Redirects to `/dashboard/designer`
4. **Verify:** See "Welcome back, Sarah Njeri!"
5. **Verify:** See featured artisans (all 5 artisans)
6. **Verify:** See search bar with category filters

### Test 3: Role-Based Access Control
1. While logged in as artisan, try: `http://localhost:3000/dashboard/designer`
2. **Verify:** Auto-redirects to `/dashboard/artisan`
3. **Verify:** Toast notification: "Access denied"

4. While logged in as designer, try: `http://localhost:3000/dashboard/artisan`
5. **Verify:** Auto-redirects to `/dashboard/designer`
6. **Verify:** Toast notification: "Access denied"

### Test 4: Catalogue Access
1. Login as artisan (John)
2. Go to: `http://localhost:3000/dashboard/artisan/catalogue`
3. **Verify:** See only John's 4 items (Dining Table, Coffee Table, Bookshelf, Bedside Tables)
4. **Verify:** Cannot see Mary's metalwork or other artisans' items

5. Login as designer (Sarah)
6. Browse catalogue
7. **Verify:** Can see ALL 16 items from all 5 artisans

### Test 5: Search Functionality
1. Login as designer
2. Use search bar: "furniture"
3. **Verify:** Returns furniture items from multiple artisans
4. Click category filter: "Metalwork"
5. **Verify:** Shows only metalwork items

---

## 🐛 TROUBLESHOOTING

### Issue: "Database already contains user data"
**Cause:** Seed data already loaded  
**Solution:** This is normal, seed command is idempotent

### Issue: "No module named 'apps.common'"
**Cause:** Backend container not rebuilt  
**Solution:**
```bash
sudo docker-compose build backend
sudo docker-compose restart backend
```

### Issue: Frontend shows old code
**Cause:** Browser cache  
**Solution:**
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Or use incognito mode

### Issue: "relation does not exist"
**Cause:** Migrations not applied  
**Solution:**
```bash
sudo docker-compose exec backend python manage.py migrate
```

### Issue: Port already in use
**Cause:** Old process still running  
**Solution:**
```bash
sudo lsof -i :8000  # Find process
sudo kill -9 PID    # Kill it
sudo docker-compose restart
```

---

## 🔄 ALTERNATIVE: FULL RESTART (If Issues Persist)

If you encounter persistent issues, do a full restart:

```bash
# Stop all containers
sudo docker-compose down

# Rebuild everything
sudo docker-compose build --no-cache

# Start fresh
sudo docker-compose up -d

# Apply migrations
sudo docker-compose exec backend python manage.py makemigrations
sudo docker-compose exec backend python manage.py migrate

# Seed data
sudo docker-compose exec backend python manage.py seed_data
```

---

## 📊 WHAT'S NEW AFTER RESTART

### Backend Changes:
- ✅ 3 new database models (DesignerProfile, SavedItem, Notification)
- ✅ 15+ new API endpoints
- ✅ 5 RBAC permission classes
- ✅ Role-aware search
- ✅ Seed data with 8 users, 16 items

### Frontend Changes:
- ✅ Separate Artisan Dashboard
- ✅ Separate Designer Dashboard
- ✅ My Catalogue page (artisan)
- ✅ Fixed registration flow (no auto-login)
- ✅ Enhanced login page
- ✅ Role-based route protection

### Data Changes:
- ✅ 5 artisan test accounts
- ✅ 3 designer test accounts
- ✅ 16 catalogue items with Kenyan pricing
- ✅ 5 sample commissions
- ✅ Sample notifications

---

## ✅ SUCCESS INDICATORS

After restart, you should see:

1. **No errors in logs**
   ```bash
   sudo docker-compose logs | grep -i error
   ```
   Should return minimal or no errors

2. **All services healthy**
   ```bash
   sudo docker-compose ps
   ```
   All should show "Up"

3. **Database populated**
   ```bash
   sudo docker-compose exec backend python manage.py shell
   >>> from django.contrib.auth import get_user_model
   >>> User = get_user_model()
   >>> User.objects.count()
   8  # Should be 8 (5 artisans + 3 designers)
   ```

4. **Frontend accessible**
   - Open `http://localhost:3000`
   - Should see landing page
   - Login should work

5. **Backend accessible**
   - Open `http://localhost:8000/api/v1/`
   - Should see API root

---

**All changes are now live! Test the platform with the provided test accounts.**