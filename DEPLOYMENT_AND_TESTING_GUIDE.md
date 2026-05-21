# CraftersLink - Deployment & Testing Guide

**Last Updated:** May 10, 2026  
**Platform Version:** 2.0 (Re-engineered)

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Building and Starting Containers](#building-and-starting-containers)
4. [Testing the Application](#testing-the-application)
5. [Troubleshooting](#troubleshooting)
6. [Production Deployment](#production-deployment)

---

## 🔧 Prerequisites

### Required Software
- **Docker:** Version 20.10 or higher
- **Docker Compose:** Version 2.0 or higher
- **Git:** For cloning the repository

### System Requirements
- **RAM:** Minimum 4GB (8GB recommended)
- **Disk Space:** Minimum 10GB free
- **OS:** Linux, macOS, or Windows with WSL2

### Verify Installation
```bash
docker --version
docker-compose --version
```

---

## 🚀 Initial Setup

### Step 1: Clone the Repository
```bash
cd ~/Desktop
git clone <repository-url> CraftersLink
cd CraftersLink
```

### Step 2: Create Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your preferred editor
nano .env  # or vim .env or code .env
```

**Important Environment Variables:**
```env
# Database
DB_NAME=crafterslink
DB_USER=postgres
DB_PASSWORD=postgres123  # Change in production!

# Django
SECRET_KEY=your-secret-key-here  # Generate a new one!
DEBUG=True  # Set to False in production

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### Step 3: Generate Secret Key (Production)
```bash
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
```
Copy the output and update `SECRET_KEY` in `.env`

---

## 🏗️ Building and Starting Containers

### Option 1: Fresh Start (Recommended for First Time)

```bash
# Stop any existing containers
docker-compose down -v

# Build images from scratch
docker-compose build --no-cache

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Option 2: Quick Restart (For Development)

```bash
# Stop containers
docker-compose down

# Start containers (uses cached images)
docker-compose up -d
```

### Option 3: Rebuild Specific Service

```bash
# Rebuild only backend
docker-compose build backend
docker-compose up -d backend

# Rebuild only frontend
docker-compose build frontend
docker-compose up -d frontend
```

---

## 🧪 Testing the Application

### Step 1: Verify All Containers are Running

```bash
docker-compose ps
```

**Expected Output:**
```
NAME                    STATUS              PORTS
crafterslink-db         Up (healthy)        5432/tcp
crafterslink-backend    Up (healthy)        0.0.0.0:8000->8000/tcp
crafterslink-frontend   Up                  0.0.0.0:5173->5173/tcp
```

### Step 2: Check Backend Health

```bash
# Check backend logs
docker-compose logs backend

# Test backend API
curl http://localhost:8000/admin/
```

**Expected:** Should return HTML (Django admin page)

### Step 3: Check Database Connection

```bash
# Access database
docker-compose exec db psql -U postgres -d crafterslink

# List tables
\dt

# Exit
\q
```

### Step 4: Verify Seed Data

```bash
# Check if seed data was created
docker-compose exec backend python manage.py shell

# In Python shell:
from django.contrib.auth import get_user_model
User = get_user_model()
print(f"Total users: {User.objects.count()}")
print(f"Artisans: {User.objects.filter(role='ARTISAN').count()}")
print(f"Designers: {User.objects.filter(role='DESIGNER').count()}")
exit()
```

**Expected Output:**
```
Total users: 9 (5 artisans + 3 designers + 1 admin)
Artisans: 5
Designers: 3
```

---

## 🌐 Testing User Flows

### Access the Application

**Frontend:** http://localhost:5173  
**Backend Admin:** http://localhost:8000/admin/  
**API Docs:** http://localhost:8000/api/v1/

### Test Accounts

#### Artisan Accounts
```
Email: john.kamau@crafterslink.com
Password: password123
Role: Artisan (Carpenter)

Email: mary.wanjiku@crafterslink.com
Password: password123
Role: Artisan (Metalworker)

Email: peter.omondi@crafterslink.com
Password: password123
Role: Artisan (Upholstery)

Email: grace.akinyi@crafterslink.com
Password: password123
Role: Artisan (Ceramics)

Email: david.mwangi@crafterslink.com
Password: password123
Role: Artisan (Textiles)
```

#### Designer Accounts
```
Email: sarah.njeri@crafterslink.com
Password: password123
Role: Interior Designer (Residential)

Email: james.otieno@crafterslink.com
Password: password123
Role: Interior Designer (Commercial)

Email: lucy.wambui@crafterslink.com
Password: password123
Role: Interior Designer (Hospitality)
```

#### Admin Account
```
Email: admin@crafterslink.com
Password: admin123
Role: Admin
```

### Test Scenarios

#### 1. Test Artisan Flow
1. **Login** as John Kamau (john.kamau@crafterslink.com)
2. **Dashboard:** Verify you see artisan dashboard with stats
3. **My Catalogue:** View existing catalogue items
4. **Add Item:** Click "Add New Item" and create a product
5. **Edit Item:** Edit an existing item
6. **My Orders:** View enquiries from designers
7. **Profile:** Update your profile information

#### 2. Test Designer Flow
1. **Login** as Sarah Njeri (sarah.njeri@crafterslink.com)
2. **Dashboard:** Verify you see designer dashboard with stats
3. **Browse Catalogue:** View all artisan products
4. **Search & Filter:** Test search and filter functionality
5. **Save Item:** Save a product to your favorites
6. **View Saved Items:** Check your saved items page
7. **Contact Artisan:** Send an enquiry about a product
8. **My Enquiries:** View sent enquiries and their status

#### 3. Test Registration Flow
1. **Logout** from current account
2. **Register:** Click "Register" and create a new account
3. **Select Role:** Choose either Artisan or Designer
4. **Fill Form:** Complete registration form
5. **Verify Redirect:** Should redirect to login page
6. **Login:** Login with new credentials
7. **Complete Profile:** Fill in profile details

---

## 🔍 Troubleshooting

### Container Issues

#### Containers Won't Start
```bash
# Check Docker daemon
sudo systemctl status docker

# Check logs for errors
docker-compose logs

# Remove all containers and volumes
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

#### Database Connection Errors
```bash
# Check database is healthy
docker-compose ps db

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

#### Backend Errors
```bash
# View backend logs
docker-compose logs backend -f

# Access backend shell
docker-compose exec backend bash

# Run migrations manually
docker-compose exec backend python manage.py migrate

# Create superuser manually
docker-compose exec backend python manage.py createsuperuser
```

#### Frontend Not Loading
```bash
# Check frontend logs
docker-compose logs frontend -f

# Rebuild frontend
docker-compose build frontend --no-cache
docker-compose up -d frontend

# Check if port 5173 is available
lsof -i :5173
```

### Common Errors

#### "Port already in use"
```bash
# Find process using the port
sudo lsof -i :8000  # or :5173 or :5432

# Kill the process
sudo kill -9 <PID>

# Or change port in docker-compose.yml
```

#### "Permission denied" on entrypoint script
```bash
# Fix permissions
chmod +x backend/docker-entrypoint.sh

# Rebuild
docker-compose build backend
```

#### Database migrations fail
```bash
# Reset database
docker-compose down -v
docker-compose up -d db
sleep 10
docker-compose up -d backend
```

---

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] Update `.env` with production values
- [ ] Set `DEBUG=False`
- [ ] Generate new `SECRET_KEY`
- [ ] Update `ALLOWED_HOSTS`
- [ ] Configure SSL certificates
- [ ] Set up proper database backups
- [ ] Configure IBM Cloud Object Storage (optional)
- [ ] Set up monitoring and logging
- [ ] Configure email service
- [ ] Update CORS settings

### Production Environment Variables

```env
DEBUG=False
ENVIRONMENT=production
SECRET_KEY=<generate-new-secure-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
```

### Using Production Frontend

```bash
# Build production frontend
docker-compose -f docker-compose.prod.yml build frontend

# Start with production config
docker-compose -f docker-compose.prod.yml up -d
```

### Database Backup

```bash
# Backup database
docker-compose exec db pg_dump -U postgres crafterslink > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T db psql -U postgres crafterslink < backup_20260510.sql
```

---

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Check Resource Usage
```bash
# Container stats
docker stats

# Disk usage
docker system df
```

### Health Checks
```bash
# Backend health
curl http://localhost:8000/admin/

# Database health
docker-compose exec db pg_isready -U postgres
```

---

## 🎯 Quick Commands Reference

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# Restart a service
docker-compose restart backend

# View logs
docker-compose logs -f backend

# Access backend shell
docker-compose exec backend bash

# Access database
docker-compose exec db psql -U postgres -d crafterslink

# Run Django commands
docker-compose exec backend python manage.py <command>

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📞 Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review this guide
3. Check GitHub issues
4. Contact development team

---

**Made with ❤️ by Bob - Senior Software Engineer**  
**CraftersLink Platform v2.0**