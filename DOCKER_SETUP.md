# CraftersLink Docker Setup Guide

This guide will help you set up and run CraftersLink using Docker, without needing Python or Node.js installed locally.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CraftersLink
```

### 2. Set Up Environment Variables

Copy the example environment files and configure them:

```bash
# Root environment file
cp .env.example .env

# Backend environment file
cp backend/.env.example backend/.env

# Frontend environment file
cp frontend/.env.example frontend/.env
```

### 3. Configure Environment Variables

Edit the `.env` files with your specific configuration:

**Root `.env` file:**
```env
DB_NAME=crafterslink
DB_USER=postgres
DB_PASSWORD=your-secure-password-here
SECRET_KEY=your-secret-key-here
```

**Backend `backend/.env` file:**
- Update `SECRET_KEY` with a secure random string
- Update `DB_PASSWORD` with a secure password
- Configure IBM Cloud Object Storage credentials if available:
  - `IBM_COS_ENDPOINT`
  - `IBM_COS_API_KEY`
  - `IBM_COS_INSTANCE_ID`
  - `IBM_COS_BUCKET_NAME`

**Frontend `frontend/.env` file:**
- Usually no changes needed for local development

### 4. Build and Start Services

```bash
docker-compose up --build
```

This command will:
- Build the Docker images for backend and frontend
- Start PostgreSQL database
- Run Django migrations
- Start the Django development server on port 8000
- Start the Vite development server on port 5173

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

## Service Details

### Database (PostgreSQL)
- **Container**: `crafterslink-db`
- **Port**: 5432
- **Image**: postgres:15-alpine
- **Volume**: `postgres_data` (persistent storage)

### Backend (Django)
- **Container**: `crafterslink-backend`
- **Port**: 8000
- **Base Image**: python:3.11-slim
- **Volume**: `./backend` mounted to `/app` (live code reload)
- **Dependencies**: Installed from `requirements.txt`

### Frontend (React + Vite)
- **Container**: `crafterslink-frontend`
- **Port**: 5173
- **Base Image**: node:18-alpine
- **Volume**: `./frontend` mounted to `/app` (live code reload)
- **Dependencies**: Installed from `package.json`

## Development Workflow

### Live Code Reloading

Both backend and frontend support live code reloading:

- **Backend**: Django's development server automatically reloads when Python files change
- **Frontend**: Vite's HMR (Hot Module Replacement) updates the browser instantly

Simply edit files in your local `backend/` or `frontend/` directories, and changes will be reflected in the running containers.

### Running Django Commands

```bash
# Create a superuser
docker-compose exec backend python manage.py createsuperuser

# Make migrations
docker-compose exec backend python manage.py makemigrations

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Django shell
docker-compose exec backend python manage.py shell
```

### Running Frontend Commands

```bash
# Install new npm package
docker-compose exec frontend npm install <package-name>

# Run linter
docker-compose exec frontend npm run lint

# Type check
docker-compose exec frontend npm run type-check
```

### Database Management

```bash
# Access PostgreSQL shell
docker-compose exec db psql -U postgres -d crafterslink

# Backup database
docker-compose exec db pg_dump -U postgres crafterslink > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres crafterslink < backup.sql
```

## Common Commands

### Start Services
```bash
docker-compose up
```

### Start Services in Background
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Stop Services and Remove Volumes
```bash
docker-compose down -v
```

### Rebuild Services
```bash
docker-compose up --build
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart a Service
```bash
docker-compose restart backend
docker-compose restart frontend
```

## Troubleshooting

### Port Already in Use

If you get a "port already in use" error:

```bash
# Check what's using the port
lsof -i :8000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # Database

# Kill the process or change the port in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if database is healthy
docker-compose ps

# Restart database
docker-compose restart db

# Check database logs
docker-compose logs db
```

### Frontend Not Loading

```bash
# Rebuild frontend
docker-compose up --build frontend

# Check frontend logs
docker-compose logs -f frontend

# Clear node_modules and reinstall
docker-compose exec frontend rm -rf node_modules
docker-compose exec frontend npm install
```

### Backend Errors

```bash
# Check backend logs
docker-compose logs -f backend

# Restart backend
docker-compose restart backend

# Run migrations
docker-compose exec backend python manage.py migrate
```

### Permission Issues

If you encounter permission issues with volumes:

```bash
# Fix ownership (Linux/Mac)
sudo chown -R $USER:$USER backend/ frontend/
```

## Network Configuration

All services are connected via the `crafterslink_net` bridge network:

- Services can communicate using their service names (e.g., `backend`, `db`)
- Frontend proxy configuration routes `/api` requests to `http://backend:8000`

## Volume Management

### Persistent Volumes

- `postgres_data`: Database data
- `backend_media`: Uploaded media files
- `backend_static`: Static files
- `backend_logs`: Application logs

### Bind Mounts (Live Reload)

- `./backend` → `/app` (backend container)
- `./frontend` → `/app` (frontend container)

### Cleaning Up Volumes

```bash
# Remove all volumes
docker-compose down -v

# Remove specific volume
docker volume rm crafterslink_postgres_data
```

## Production Considerations

For production deployment:

1. Update `docker-compose.yml` to use production-ready configurations
2. Set `DEBUG=False` in backend environment
3. Use proper secret keys and passwords
4. Configure proper CORS settings
5. Use a production WSGI server (Gunicorn is already included)
6. Set up SSL/TLS certificates
7. Configure proper logging
8. Use managed database services
9. Set up proper backup strategies

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Vite Documentation](https://vitejs.dev/)

## Support

For issues or questions, please refer to the main README.md or open an issue in the repository.

# Made with Bob