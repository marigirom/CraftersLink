# QUICK DEPLOYMENT GUIDE
## CraftersLink - Apply All Changes

**⚡ Fast Track Deployment**

---

## 🚀 QUICK START (5 Commands)

```bash
# 1. Stop containers
docker-compose down

# 2. Rebuild (with no cache)
docker-compose build --no-cache

# 3. Start containers
docker-compose up -d

# 4. Run migrations
docker-compose exec backend python manage.py makemigrations
docker-compose exec backend python manage.py migrate

# 5. Verify
docker-compose ps
```

---

## ✅ WHAT TO TEST

### 1. Registration Flow (CRITICAL FIX)
- Go to: `http://localhost:3000/register`
- Register new account
- **VERIFY:** Redirects to login (NOT auto-logged in) ✅
- **VERIFY:** Green success banner appears ✅

### 2. Login Flow
- Login with credentials
- **VERIFY ARTISAN:** Goes to `/dashboard/artisan` ✅
- **VERIFY DESIGNER:** Goes to `/dashboard/designer` ✅

### 3. New API Endpoints
```bash
# Get token first by logging in, then:

# Designer profile
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/v1/auth/designer/profile/

# Search
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/v1/search/?q=furniture

# Notifications
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/v1/notifications/

# Saved items
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/v1/saved/
```

---

## 🐛 QUICK FIXES

### Migrations Fail?
```bash
docker-compose exec backend python manage.py showmigrations
docker-compose exec backend python manage.py migrate --fake-initial
```

### Frontend Not Updating?
```bash
# Clear browser cache or use incognito mode
docker-compose build --no-cache frontend
docker-compose restart frontend
```

### Port Conflict?
```bash
sudo lsof -i :8000  # Find process
sudo kill -9 PID    # Kill it
```

---

## 📊 VERIFY SUCCESS

```bash
# All services running?
docker-compose ps

# Check logs
docker-compose logs backend | tail -20
docker-compose logs frontend | tail -20

# Test backend
curl http://localhost:8000/api/v1/auth/me/

# Test frontend
curl http://localhost:3000/
```

---

## 🆘 NUCLEAR OPTION (Complete Reset)

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

---

## 📝 NEW FEATURES DEPLOYED

✅ 3 New Database Models  
✅ 15+ New API Endpoints  
✅ Complete RBAC System  
✅ Fixed Registration Flow  
✅ Role-Based Redirects  
✅ Search Functionality  
✅ Notifications System  
✅ Saved Items System  

---

**For detailed instructions, see:** [`DEPLOYMENT_INSTRUCTIONS.md`](DEPLOYMENT_INSTRUCTIONS.md:1)