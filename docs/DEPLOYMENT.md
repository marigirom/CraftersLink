# CraftersLink - Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying CraftersLink using Docker and docker-compose for local development and production environments.

---

## Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Environment Configuration](#2-environment-configuration)
3. [Docker Setup](#3-docker-setup)
4. [Local Development](#4-local-development)
5. [Production Deployment](#5-production-deployment)
6. [IBM Cloud Deployment](#6-ibm-cloud-deployment)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites

### Required Software
- Docker 24.0+ and Docker Compose 2.20+
- Git
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### IBM Cloud Services
- IBM Cloud Object Storage instance
- IBM Cloud account with API key

### System Requirements
- **Development:** 8GB RAM, 20GB disk space
- **Production:** 16GB RAM, 50GB disk space

---

## 2. Environment Configuration

### 2.1 Backend Environment Variables

Create `backend/.env`:

```bash
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database Configuration
DB_NAME=crafterslink
DB_USER=postgres
DB_PASSWORD=postgres123
DB_HOST=db
DB_PORT=5432

# IBM Cloud Object Storage
IBM_COS_ENDPOINT=https://s3.us-south.cloud-object-storage.appdomain.cloud
IBM_COS_API_KEY=your_ibm_cos_api_key
IBM_COS_INSTANCE_ID=crn:v1:bluemix:public:cloud-object-storage:global:a/...
IBM_COS_BUCKET_NAME=crafterslink-media
IBM_COS_AUTH_ENDPOINT=https://iam.cloud.ibm.com/identity/token
IBM_COS_PUBLIC_ENDPOINT=https://crafterslink-media.s3.us-south.cloud-object-storage.appdomain.cloud

# JWT Configuration
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=10080  # minutes (7 days)

# Email Configuration (for production)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Security (Production only)
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
```

### 2.2 Frontend Environment Variables

Create `frontend/.env`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=30000

# IBM Cloud Object Storage (for direct uploads if needed)
VITE_IBM_COS_PUBLIC_ENDPOINT=https://crafterslink-media.s3.us-south.cloud-object-storage.appdomain.cloud

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### 2.3 Production Environment Variables

For production, update the following:

```bash
# Backend .env.production
DEBUG=False
ALLOWED_HOSTS=crafterslink.com,www.crafterslink.com,api.crafterslink.com
SECRET_KEY=generate-strong-secret-key-here

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

# Database (use managed PostgreSQL)
DB_HOST=your-postgres-host.com
DB_PASSWORD=strong-production-password

# CORS
CORS_ALLOWED_ORIGINS=https://crafterslink.com,https://www.crafterslink.com
```

---

## 3. Docker Setup

### 3.1 Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    musl-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy project
COPY . /app/

# Create media directory
RUN mkdir -p /app/media

# Collect static files
RUN python manage.py collectstatic --noinput || true

# Run migrations and start server
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
```

### 3.2 Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3.3 Frontend Nginx Configuration

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy (optional, if not using separate domain)
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3.4 Docker Compose Configuration

Create `deploy/docker-compose.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    container_name: crafterslink-db
    environment:
      POSTGRES_DB: crafterslink
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - crafterslink-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ../backend
      dockerfile: Dockerfile
    container_name: crafterslink-backend
    command: sh -c "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"
    volumes:
      - ../backend:/app
      - backend_media:/app/media
      - backend_static:/app/staticfiles
    ports:
      - "8000:8000"
    env_file:
      - ../backend/.env
    depends_on:
      db:
        condition: service_healthy
    networks:
      - crafterslink-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/v1/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    container_name: crafterslink-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - crafterslink-network
    environment:
      - VITE_API_BASE_URL=http://localhost:8000/api/v1

  nginx:
    image: nginx:alpine
    container_name: crafterslink-nginx
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - backend_static:/usr/share/nginx/html/static:ro
      - backend_media:/usr/share/nginx/html/media:ro
    ports:
      - "80:80"
    depends_on:
      - backend
      - frontend
    networks:
      - crafterslink-network

volumes:
  postgres_data:
  backend_media:
  backend_static:

networks:
  crafterslink-network:
    driver: bridge
```

### 3.5 Production Docker Compose

Create `deploy/docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ../backend
      dockerfile: Dockerfile
    command: gunicorn crafterslink.wsgi:application --bind 0.0.0.0:8000 --workers 4
    environment:
      - DEBUG=False
    env_file:
      - ../backend/.env.production

  frontend:
    build:
      context: ../frontend
      dockerfile: Dockerfile
      args:
        - VITE_API_BASE_URL=https://api.crafterslink.com/api/v1

  nginx:
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    ports:
      - "80:80"
      - "443:443"
```

---

## 4. Local Development

### 4.1 Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/crafterslink.git
cd crafterslink

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your IBM COS credentials
nano backend/.env

# Start all services
cd deploy
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 4.2 Database Setup

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Load seed data (optional)
docker-compose exec backend python manage.py seed_data
```

### 4.3 Access Services

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/v1
- **Django Admin:** http://localhost:8000/admin
- **API Documentation:** http://localhost:8000/api/v1/docs

### 4.4 Development Workflow

```bash
# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# View backend logs
docker-compose logs -f backend

# View frontend logs
docker-compose logs -f frontend

# Execute Django commands
docker-compose exec backend python manage.py <command>

# Access database
docker-compose exec db psql -U postgres -d crafterslink

# Clean up volumes (WARNING: deletes data)
docker-compose down -v
```

---

## 5. Production Deployment

### 5.1 Pre-deployment Checklist

- [ ] Update environment variables in `.env.production`
- [ ] Generate strong `SECRET_KEY`
- [ ] Configure production database
- [ ] Set up IBM Cloud Object Storage
- [ ] Configure email service
- [ ] Set up SSL certificates
- [ ] Configure domain DNS
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### 5.2 Deploy to Production

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### 5.3 SSL Configuration with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d crafterslink.com -d www.crafterslink.com -d api.crafterslink.com

# Auto-renewal (add to crontab)
0 0 * * * certbot renew --quiet
```

### 5.4 Production Nginx Configuration

Create `deploy/nginx/nginx.prod.conf`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name crafterslink.com www.crafterslink.com;
    return 301 https://$server_name$request_uri;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name crafterslink.com www.crafterslink.com;

    ssl_certificate /etc/letsencrypt/live/crafterslink.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crafterslink.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static files
    location /static/ {
        alias /usr/share/nginx/html/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /usr/share/nginx/html/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Backend API
server {
    listen 443 ssl http2;
    server_name api.crafterslink.com;

    ssl_certificate /etc/letsencrypt/live/crafterslink.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crafterslink.com/privkey.pem;

    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

---

## 6. IBM Cloud Deployment

### 6.1 IBM Cloud Foundry Deployment

Create `deploy/ibm-cloud/manifest.yml`:

```yaml
applications:
- name: crafterslink-backend
  memory: 512M
  instances: 2
  buildpack: python_buildpack
  command: gunicorn crafterslink.wsgi:application --bind 0.0.0.0:$PORT
  path: ../../backend
  services:
    - crafterslink-postgres
    - crafterslink-cos
  env:
    DJANGO_SETTINGS_MODULE: crafterslink.settings
    SECRET_KEY: ((secret-key))

- name: crafterslink-frontend
  memory: 256M
  instances: 2
  buildpack: staticfile_buildpack
  path: ../../frontend/dist
```

Deploy commands:
```bash
# Login to IBM Cloud
ibmcloud login

# Target Cloud Foundry
ibmcloud target --cf

# Deploy backend
cd backend
ibmcloud cf push crafterslink-backend

# Deploy frontend
cd ../frontend
npm run build
ibmcloud cf push crafterslink-frontend
```

### 6.2 IBM Code Engine Deployment

```bash
# Create project
ibmcloud ce project create --name crafterslink

# Build and deploy backend
ibmcloud ce application create \
  --name crafterslink-backend \
  --image us.icr.io/crafterslink/backend:latest \
  --port 8000 \
  --env-from-secret crafterslink-secrets \
  --min-scale 1 \
  --max-scale 5

# Build and deploy frontend
ibmcloud ce application create \
  --name crafterslink-frontend \
  --image us.icr.io/crafterslink/frontend:latest \
  --port 80 \
  --min-scale 1 \
  --max-scale 3
```

---

## 7. Troubleshooting

### 7.1 Common Issues

**Database Connection Failed:**
```bash
# Check database is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Verify connection settings
docker-compose exec backend python manage.py dbshell
```

**Backend Not Starting:**
```bash
# Check logs
docker-compose logs backend

# Verify migrations
docker-compose exec backend python manage.py showmigrations

# Run migrations manually
docker-compose exec backend python manage.py migrate
```

**Frontend Build Errors:**
```bash
# Clear node_modules and rebuild
docker-compose exec frontend rm -rf node_modules
docker-compose exec frontend npm install
docker-compose restart frontend
```

**IBM COS Connection Issues:**
```bash
# Test COS connection
docker-compose exec backend python manage.py shell
>>> from apps.common.services.storage_service import storage_service
>>> storage_service.client.list_buckets()
```

### 7.2 Performance Optimization

**Database Query Optimization:**
```bash
# Enable query logging
# In settings.py, add:
LOGGING = {
    'loggers': {
        'django.db.backends': {
            'level': 'DEBUG',
        }
    }
}

# Analyze slow queries
docker-compose exec db psql -U postgres -d crafterslink
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

**Memory Issues:**
```bash
# Check container memory usage
docker stats

# Increase memory limits in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

### 7.3 Backup and Restore

**Database Backup:**
```bash
# Backup
docker-compose exec db pg_dump -U postgres crafterslink > backup_$(date +%Y%m%d).sql

# Restore
docker-compose exec -T db psql -U postgres crafterslink < backup_20260502.sql
```

**Media Files Backup:**
```bash
# Backup media files
docker cp crafterslink-backend:/app/media ./media_backup

# Restore media files
docker cp ./media_backup crafterslink-backend:/app/media
```

---

## 8. Monitoring and Logging

### 8.1 Application Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Save logs to file
docker-compose logs > logs_$(date +%Y%m%d).txt
```

### 8.2 Health Checks

```bash
# Backend health check
curl http://localhost:8000/api/v1/health/

# Database health check
docker-compose exec db pg_isready -U postgres

# Check all services
docker-compose ps
```

---

## 9. Scaling

### 9.1 Horizontal Scaling

```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
      
  frontend:
    deploy:
      replicas: 2
```

### 9.2 Load Balancing

Add load balancer configuration in nginx:

```nginx
upstream backend_servers {
    least_conn;
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    location / {
        proxy_pass http://backend_servers;
    }
}
```

---

This deployment guide provides comprehensive instructions for deploying CraftersLink in various environments, from local development to production on IBM Cloud.