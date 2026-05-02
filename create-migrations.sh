#!/bin/bash

echo "=== Creating migrations directories ==="
docker compose exec backend mkdir -p /app/apps/users/migrations
docker compose exec backend mkdir -p /app/apps/artisans/migrations
docker compose exec backend mkdir -p /app/apps/commissions/migrations
docker compose exec backend mkdir -p /app/apps/invoices/migrations
docker compose exec backend mkdir -p /app/apps/common/migrations

echo ""
echo "=== Creating __init__.py files ==="
docker compose exec backend touch /app/apps/users/migrations/__init__.py
docker compose exec backend touch /app/apps/artisans/migrations/__init__.py
docker compose exec backend touch /app/apps/commissions/migrations/__init__.py
docker compose exec backend touch /app/apps/invoices/migrations/__init__.py
docker compose exec backend touch /app/apps/common/migrations/__init__.py

echo ""
echo "=== Generating migrations ==="
docker compose exec backend python manage.py makemigrations

echo ""
echo "=== Applying migrations ==="
docker compose exec backend python manage.py migrate

echo ""
echo "=== Migration complete! ==="
echo "Backend should now be running. Check with:"
echo "docker compose ps"

# Made with Bob
