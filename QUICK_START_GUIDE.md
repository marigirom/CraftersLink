# CraftersLink - Quick Start Guide 🚀

## Start Backend Container (Already Built)

If you've already built the backend container and just need to start it:

### Option 1: Start All Services
```bash
sudo docker compose up -d
```

### Option 2: Start Only Backend
```bash
sudo docker compose up -d backend
```

### Option 3: Start with Logs (See Output)
```bash
sudo docker compose up backend
```
Press `Ctrl+C` to stop when done.

## Check Container Status

```bash
# See all running containers
sudo docker compose ps

# Check backend logs
sudo docker compose logs backend

# Follow logs in real-time
sudo docker compose logs -f backend
```

## Stop Containers

```bash
# Stop all services
sudo docker compose stop

# Stop only backend
sudo docker compose stop backend

# Stop and remove containers
sudo docker compose down
```

## Restart Backend

```bash
# Restart backend container
sudo docker compose restart backend

# Or stop and start
sudo docker compose stop backend
sudo docker compose start backend
```

## Full Rebuild (If Needed)

If the backend still crashes after starting, you need to rebuild:

```bash
# Stop everything
sudo docker compose down

# Rebuild backend without cache
sudo docker compose build backend --no-cache

# Start everything
sudo docker compose up -d

# Watch logs
sudo docker compose logs -f backend
```

## Access the Platform

Once containers are running:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/v1
- **Admin Panel:** http://localhost:8000/admin
- **Health Check:** http://localhost:8000/api/v1/health/

## Test Credentials

**Superuser (Admin):**
- Email: admin@crafterslink.com
- Password: admin123

**Test Artisans:**
- james.mwangi@crafterslink.ke / CraftersLink2026!
- aisha.otieno@crafterslink.ke / CraftersLink2026!
- peter.kamau@crafterslink.ke / CraftersLink2026!
- grace.njeri@crafterslink.ke / CraftersLink2026!
- samuel.ochieng@crafterslink.ke / CraftersLink2026!

**Test Designers:**
- amina.hassan@crafterslink.ke / CraftersLink2026!
- brian.njoroge@crafterslink.ke / CraftersLink2026!
- carol.wanjiku@crafterslink.ke / CraftersLink2026!

## Troubleshooting

### Backend keeps crashing?

The entrypoint script was fixed but the container is using a cached version. You MUST rebuild:

```bash
sudo docker compose down
sudo docker compose build backend --no-cache
sudo docker compose up -d
```

### Check if backend is healthy

```bash
curl http://localhost:8000/api/v1/health/
```

Expected response: `{"status":"healthy"}`

### View detailed logs

```bash
# Last 100 lines
sudo docker compose logs backend --tail 100

# Follow in real-time
sudo docker compose logs -f backend

# All services
sudo docker compose logs -f
```

### Database connection issues?

```bash
# Check if database is running
sudo docker compose ps db

# Check database logs
sudo docker compose logs db

# Restart database
sudo docker compose restart db
```

### Port already in use?

```bash
# Check what's using port 8000
sudo lsof -i :8000

# Check what's using port 5173
sudo lsof -i :5173

# Kill process if needed
sudo kill -9 <PID>
```

## Common Commands Cheat Sheet

```bash
# Start all services
sudo docker compose up -d

# Stop all services
sudo docker compose stop

# Restart a service
sudo docker compose restart backend

# View logs
sudo docker compose logs -f backend

# Rebuild a service
sudo docker compose build backend --no-cache

# Remove everything (including volumes)
sudo docker compose down -v

# Check status
sudo docker compose ps

# Execute command in container
sudo docker compose exec backend python manage.py shell

# Run migrations manually
sudo docker compose exec backend python manage.py migrate

# Create superuser manually
sudo docker compose exec backend python manage.py createsuperuser

# Seed database manually
sudo docker compose exec backend python manage.py seed_crafterslink
```

## Expected Startup Output

When backend starts successfully, you should see:

```
crafterslink-backend  | 🚀 CraftersLink Backend Starting...
crafterslink-backend  | ⏳ Waiting for PostgreSQL...
crafterslink-backend  | ✅ PostgreSQL is ready!
crafterslink-backend  | 🔄 Running database migrations...
crafterslink-backend  | Operations to perform:
crafterslink-backend  |   Apply all migrations: admin, artisans, auth, commissions, common, contenttypes, invoices, sessions, users
crafterslink-backend  | Running migrations:
crafterslink-backend  |   No migrations to apply.
crafterslink-backend  | 📦 Collecting static files...
crafterslink-backend  | 162 static files copied to '/app/staticfiles'.
crafterslink-backend  | 👤 Creating superuser if needed...
crafterslink-backend  | ✅ Superuser created: admin@crafterslink.com / admin123
crafterslink-backend  | 🌱 Seeding database with test data...
crafterslink-backend  | ✅ Created 5 artisan users
crafterslink-backend  | ✅ Created 3 designer users
crafterslink-backend  | ✅ Created 15 products
crafterslink-backend  | ✅ Created 5 commissions
crafterslink-backend  | ✅ Created 8 saved items
crafterslink-backend  | ✅ Created 2 projects
crafterslink-backend  | ✅ Created 10 notifications
crafterslink-backend  | ✅ Backend initialization complete!
crafterslink-backend  | 🎯 Starting Django server...
crafterslink-backend  | Watching for file changes with StatReloader
crafterslink-backend  | Performing system checks...
crafterslink-backend  | System check identified no issues (0 silenced).
crafterslink-backend  | Django version 5.0, using settings 'crafterslink.settings'
crafterslink-backend  | Starting development server at http://0.0.0.0:8000/
crafterslink-backend  | Quit the server with CONTROL-C.
```

## Next Steps After Successful Start

1. ✅ Open frontend: http://localhost:5173
2. ✅ Test login with admin credentials
3. ✅ Test login with artisan credentials
4. ✅ Test login with designer credentials
5. ✅ Browse artisan catalogue
6. ✅ Test designer catalogue browsing
7. ✅ Verify all images load correctly

---

Made with Bob 🤖