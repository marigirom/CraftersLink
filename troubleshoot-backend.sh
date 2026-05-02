#!/bin/bash

echo "=== CraftersLink Backend Troubleshooting ==="
echo ""

echo "1. Checking Docker Compose Status..."
docker compose ps

echo ""
echo "2. Checking Backend Container Logs (last 50 lines)..."
docker compose logs backend --tail 50

echo ""
echo "3. Checking if backend container exists..."
docker ps -a | grep crafterslink-backend

echo ""
echo "4. Checking database connection..."
docker compose exec db psql -U postgres -d crafterslink -c "SELECT version();" 2>/dev/null || echo "Cannot connect to database"

echo ""
echo "5. Checking if migrations directory exists..."
ls -la backend/apps/users/migrations/ 2>/dev/null || echo "Migrations directory not found"

echo ""
echo "6. Checking environment variables..."
docker compose exec backend env | grep -E "DB_|DEBUG|SECRET" 2>/dev/null || echo "Cannot access backend environment"

echo ""
echo "=== Recommended Actions ==="
echo ""
echo "If backend is not running:"
echo "  1. Run: sudo ./restart-containers.sh"
echo "  2. Run: sudo ./create-migrations.sh"
echo ""
echo "If migrations fail:"
echo "  1. Check that migrations directories exist"
echo "  2. Run: sudo docker compose exec backend python manage.py makemigrations"
echo ""
echo "If database connection fails:"
echo "  1. Check .env file has correct DB_PASSWORD"
echo "  2. Restart database: sudo docker compose restart db"

# Made with Bob
