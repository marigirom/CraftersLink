#!/bin/bash

echo "=== Backend Container Status ==="
docker compose ps backend

echo ""
echo "=== Recent Backend Logs ==="
docker compose logs backend --tail 100

echo ""
echo "=== Checking if backend is running ==="
docker compose exec backend ps aux 2>/dev/null || echo "Backend container is not running or not accessible"

# Made with Bob
