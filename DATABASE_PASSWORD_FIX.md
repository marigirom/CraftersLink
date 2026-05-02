# Database Password Authentication Fix

## Problem
The backend was failing to connect to PostgreSQL with the error:
```
psycopg2.OperationalError: connection to server at "db" (172.18.0.2), port 5432 failed: 
FATAL: password authentication failed for user "postgres"
```

## Root Cause
The `.env` file was missing from the project root directory. Without it, Docker Compose and the Django backend were using different default values for the database password, causing authentication failures.

## Solution Applied
Created a `.env` file in the project root with the correct database configuration matching the defaults in both `docker-compose.yml` and `backend/crafterslink/settings.py`:

```env
DB_NAME=crafterslink
DB_USER=postgres
DB_PASSWORD=postgres123
DB_HOST=db
DB_PORT=5432
```

## Steps to Apply the Fix

### Option 1: Restart Docker Containers (Recommended)
Run these commands in your terminal:

```bash
# Stop all containers
docker compose down

# Start containers with the new configuration
docker compose up -d

# Check the logs to verify successful connection
docker compose logs backend
```

### Option 2: Restart Only the Backend Container
If you want to keep the database running:

```bash
# Restart just the backend
docker compose restart backend

# Check the logs
docker compose logs -f backend
```

### Option 3: Manual Docker Commands (if docker compose has issues)
```bash
# Stop containers
docker stop crafterslink-backend crafterslink-db crafterslink-frontend

# Remove containers
docker rm crafterslink-backend crafterslink-db crafterslink-frontend

# Start fresh
docker compose up -d
```

## Verification
After restarting, you should see:
1. No password authentication errors in the logs
2. Successful database migrations
3. Backend server running on port 8000

Check with:
```bash
docker compose logs backend | grep -i "error\|password\|migration"
```

## Additional Notes
- The `.env` file is now created and configured for local development
- The password `postgres123` is suitable for development only
- For production, change the password in the `.env` file to a secure value
- The `.env` file is already in `.gitignore` to prevent committing sensitive data

## Security Reminder
⚠️ **Important**: Before deploying to production:
1. Generate a strong, unique password for `DB_PASSWORD`
2. Update the `SECRET_KEY` with a secure random value
3. Set `DEBUG=False`
4. Configure proper `ALLOWED_HOSTS`
5. Set up IBM Cloud Object Storage credentials if using file uploads