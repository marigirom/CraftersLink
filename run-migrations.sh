#!/bin/bash

echo "=== Running Django Migrations ==="
docker compose exec backend python manage.py makemigrations

echo ""
echo "=== Applying Migrations ==="
docker compose exec backend python manage.py migrate

echo ""
echo "=== Migration Status ==="
docker compose exec backend python manage.py showmigrations

echo ""
echo "=== Creating Superuser (Optional) ==="
echo "To create a superuser, run:"
echo "docker compose exec backend python manage.py createsuperuser"

# Made with Bob
