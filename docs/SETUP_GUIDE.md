# CraftersLink - Development Setup Guide

## Overview
This guide walks you through setting up the CraftersLink development environment from scratch, covering both local development and Docker-based workflows.

---

## Table of Contents
1. [Quick Start (Docker)](#1-quick-start-docker)
2. [Local Development Setup](#2-local-development-setup)
3. [Backend Setup](#3-backend-setup)
4. [Frontend Setup](#4-frontend-setup)
5. [IBM Cloud Object Storage Setup](#5-ibm-cloud-object-storage-setup)
6. [Development Workflow](#6-development-workflow)
7. [Testing](#7-testing)
8. [Common Tasks](#8-common-tasks)

---

## 1. Quick Start (Docker)

### Prerequisites
- Docker 24.0+
- Docker Compose 2.20+
- Git

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/yourusername/crafterslink.git
cd crafterslink

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Update IBM COS credentials in backend/.env
nano backend/.env

# 4. Start all services
cd deploy
docker-compose up -d

# 5. Run migrations
docker-compose exec backend python manage.py migrate

# 6. Create superuser
docker-compose exec backend python manage.py createsuperuser

# 7. Load seed data (optional)
docker-compose exec backend python manage.py seed_data

# 8. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/v1
# Django Admin: http://localhost:8000/admin
```

---

## 2. Local Development Setup

### 2.1 System Requirements

**Operating System:**
- macOS 11+
- Ubuntu 20.04+
- Windows 10+ with WSL2

**Software:**
- Python 3.11+
- Node.js 18+
- PostgreSQL 16+
- Git

### 2.2 Install Dependencies

**macOS:**
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install python@3.11 node postgresql git
```

**Ubuntu:**
```bash
# Update package list
sudo apt update

# Install dependencies
sudo apt install python3.11 python3.11-venv python3-pip nodejs npm postgresql postgresql-contrib git
```

**Windows (WSL2):**
```bash
# Install WSL2 and Ubuntu
wsl --install

# Follow Ubuntu instructions above
```

---

## 3. Backend Setup

### 3.1 Create Virtual Environment

```bash
cd backend

# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate

# Windows:
venv\Scripts\activate
```

### 3.2 Install Python Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt
```

### 3.3 Database Setup

```bash
# Start PostgreSQL
# macOS:
brew services start postgresql

# Ubuntu:
sudo systemctl start postgresql

# Create database and user
psql postgres
CREATE DATABASE crafterslink;
CREATE USER crafterslink_user WITH PASSWORD 'your_password';
ALTER ROLE crafterslink_user SET client_encoding TO 'utf8';
ALTER ROLE crafterslink_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE crafterslink_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE crafterslink TO crafterslink_user;
\q
```

### 3.4 Configure Environment

Create `backend/.env`:

```bash
# Django Settings
SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=crafterslink
DB_USER=crafterslink_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# IBM Cloud Object Storage
IBM_COS_ENDPOINT=https://s3.us-south.cloud-object-storage.appdomain.cloud
IBM_COS_API_KEY=your_api_key
IBM_COS_INSTANCE_ID=your_instance_id
IBM_COS_BUCKET_NAME=crafterslink-media
IBM_COS_AUTH_ENDPOINT=https://iam.cloud.ibm.com/identity/token

# JWT
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=10080

# Email (Development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 3.5 Run Migrations

```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load seed data (optional)
python manage.py seed_data
```

### 3.6 Start Development Server

```bash
# Start Django development server
python manage.py runserver

# Server will be available at http://localhost:8000
```

---

## 4. Frontend Setup

### 4.1 Install Node Dependencies

```bash
cd frontend

# Install dependencies
npm install

# Or using yarn
yarn install
```

### 4.2 Configure Environment

Create `frontend/.env`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_API_TIMEOUT=30000

# IBM COS
VITE_IBM_COS_PUBLIC_ENDPOINT=https://crafterslink-media.s3.us-south.cloud-object-storage.appdomain.cloud

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### 4.3 Start Development Server

```bash
# Start Vite development server
npm run dev

# Or using yarn
yarn dev

# Server will be available at http://localhost:5173
```

### 4.4 Build for Production

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

---

## 5. IBM Cloud Object Storage Setup

### 5.1 Create IBM Cloud Account

1. Go to [IBM Cloud](https://cloud.ibm.com)
2. Sign up for a free account
3. Verify your email

### 5.2 Create Object Storage Instance

```bash
# Using IBM Cloud CLI
ibmcloud login

# Create Object Storage instance
ibmcloud resource service-instance-create crafterslink-storage \
  cloud-object-storage standard global

# Create service credentials
ibmcloud resource service-key-create crafterslink-credentials \
  Writer --instance-name crafterslink-storage
```

### 5.3 Create Bucket

```bash
# Install IBM COS plugin
ibmcloud plugin install cloud-object-storage

# Create bucket
ibmcloud cos bucket-create \
  --bucket crafterslink-media \
  --ibm-service-instance-id <your-instance-id> \
  --region us-south
```

### 5.4 Configure CORS

Create `cors-config.json`:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "http://localhost:5173"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Apply CORS configuration:

```bash
ibmcloud cos bucket-cors-put \
  --bucket crafterslink-media \
  --cors-configuration file://cors-config.json
```

### 5.5 Set Public Access Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::crafterslink-media/products/*",
        "arn:aws:s3:::crafterslink-media/portfolios/*",
        "arn:aws:s3:::crafterslink-media/profiles/*"
      ]
    }
  ]
}
```

---

## 6. Development Workflow

### 6.1 Git Workflow

```bash
# Create feature branch
git checkout -b feature/commission-workflow

# Make changes and commit
git add .
git commit -m "feat: implement commission workflow"

# Push to remote
git push origin feature/commission-workflow

# Create pull request on GitHub
```

### 6.2 Code Style

**Backend (Python):**
```bash
# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Format code with black
black .

# Sort imports with isort
isort .

# Lint with flake8
flake8 .

# Type checking with mypy
mypy .
```

**Frontend (TypeScript):**
```bash
# Format code with prettier
npm run format

# Lint with ESLint
npm run lint

# Type checking
npm run type-check
```

### 6.3 Database Migrations

```bash
# Create migration after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Rollback migration
python manage.py migrate app_name migration_name
```

### 6.4 API Testing

**Using curl:**
```bash
# Register user
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "password_confirm": "TestPass123!",
    "role": "DESIGNER"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Get products (with token)
curl -X GET http://localhost:8000/api/v1/products/ \
  -H "Authorization: Bearer <access_token>"
```

**Using HTTPie:**
```bash
# Install HTTPie
pip install httpie

# Register user
http POST localhost:8000/api/v1/auth/register/ \
  username=testuser \
  email=test@example.com \
  password=TestPass123! \
  password_confirm=TestPass123! \
  role=DESIGNER

# Login
http POST localhost:8000/api/v1/auth/login/ \
  email=test@example.com \
  password=TestPass123!

# Get products
http GET localhost:8000/api/v1/products/ \
  "Authorization: Bearer <access_token>"
```

---

## 7. Testing

### 7.1 Backend Tests

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.users

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html

# Run specific test class
python manage.py test apps.users.tests.UserModelTest

# Run specific test method
python manage.py test apps.users.tests.UserModelTest.test_create_user
```

### 7.2 Frontend Tests

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### 7.3 Integration Tests

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Run integration tests
python manage.py test --settings=crafterslink.settings_test

# Stop test database
docker-compose -f docker-compose.test.yml down -v
```

---

## 8. Common Tasks

### 8.1 Create New Django App

```bash
# Create app
python manage.py startapp app_name

# Move to apps directory
mv app_name apps/

# Update apps/app_name/apps.py
class AppNameConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.app_name'

# Add to INSTALLED_APPS in settings.py
INSTALLED_APPS = [
    ...
    'apps.app_name',
]
```

### 8.2 Create Management Command

```bash
# Create command file
mkdir -p apps/app_name/management/commands
touch apps/app_name/management/commands/command_name.py

# Command template
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Description of command'
    
    def add_arguments(self, parser):
        parser.add_argument('arg_name', type=str)
    
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Command executed'))

# Run command
python manage.py command_name arg_value
```

### 8.3 Create API Endpoint

```bash
# 1. Define model in models.py
# 2. Create serializer in serializers.py
# 3. Create view in views.py
# 4. Add URL pattern in urls.py

# Example serializer
from rest_framework import serializers

class ModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Model
        fields = '__all__'

# Example view
from rest_framework import viewsets

class ModelViewSet(viewsets.ModelViewSet):
    queryset = Model.objects.all()
    serializer_class = ModelSerializer

# Example URL
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'models', ModelViewSet)

urlpatterns = router.urls
```

### 8.4 Add React Component

```bash
# Create component file
touch frontend/src/components/ComponentName.tsx

# Component template
import React from 'react';

interface ComponentNameProps {
  prop1: string;
  prop2: number;
}

const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  return (
    <div>
      <h1>{prop1}</h1>
      <p>{prop2}</p>
    </div>
  );
};

export default ComponentName;
```

### 8.5 Database Operations

```bash
# Access Django shell
python manage.py shell

# Access database shell
python manage.py dbshell

# Dump data to JSON
python manage.py dumpdata app_name.Model --indent 2 > data.json

# Load data from JSON
python manage.py loaddata data.json

# Reset database (WARNING: deletes all data)
python manage.py flush

# Create database backup
pg_dump crafterslink > backup.sql

# Restore database
psql crafterslink < backup.sql
```

### 8.6 Clear Cache

```bash
# Clear Django cache
python manage.py clear_cache

# Clear npm cache
npm cache clean --force

# Clear pip cache
pip cache purge
```

### 8.7 Update Dependencies

```bash
# Backend
pip list --outdated
pip install --upgrade package_name
pip freeze > requirements.txt

# Frontend
npm outdated
npm update package_name
npm install
```

---

## 9. Troubleshooting

### 9.1 Port Already in Use

```bash
# Find process using port
# macOS/Linux:
lsof -i :8000
kill -9 <PID>

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### 9.2 Database Connection Error

```bash
# Check PostgreSQL is running
# macOS:
brew services list

# Ubuntu:
sudo systemctl status postgresql

# Restart PostgreSQL
# macOS:
brew services restart postgresql

# Ubuntu:
sudo systemctl restart postgresql
```

### 9.3 Module Not Found

```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Check Python path
python -c "import sys; print(sys.path)"
```

### 9.4 CORS Errors

```bash
# Check CORS_ALLOWED_ORIGINS in settings.py
# Ensure frontend URL is included
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
]

# Restart backend server
```

### 9.5 IBM COS Upload Fails

```bash
# Test COS connection
python manage.py shell
>>> from apps.common.services.storage_service import storage_service
>>> storage_service.client.list_buckets()

# Check credentials in .env
# Verify bucket permissions
```

---

## 10. IDE Setup

### 10.1 VS Code

**Recommended Extensions:**
- Python
- Pylance
- Django
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Docker
- GitLens

**Settings (`.vscode/settings.json`):**
```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/bin/python",
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 10.2 PyCharm

1. Open project
2. Configure Python interpreter: Settings → Project → Python Interpreter
3. Select virtual environment: `backend/venv`
4. Enable Django support: Settings → Languages & Frameworks → Django
5. Set Django project root: `backend`
6. Set settings: `crafterslink/settings.py`

---

## 11. Resources

### Documentation
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [IBM Carbon Design System](https://carbondesignsystem.com/)
- [IBM Cloud Object Storage](https://cloud.ibm.com/docs/cloud-object-storage)

### Community
- [Django Forum](https://forum.djangoproject.com/)
- [React Community](https://react.dev/community)
- [Stack Overflow](https://stackoverflow.com/)

---

This setup guide provides everything needed to get started with CraftersLink development. For deployment instructions, see [`DEPLOYMENT.md`](DEPLOYMENT.md).