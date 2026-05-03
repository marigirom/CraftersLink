#!/bin/bash

echo "=== CraftersLink Debug Script ==="
echo ""

echo "1. Checking Docker containers status..."
docker compose ps
echo ""

echo "2. Checking backend logs for errors..."
docker compose logs backend --tail=50
echo ""

echo "3. Checking frontend logs for errors..."
docker compose logs frontend --tail=50
echo ""

echo "4. Checking if backend is responding..."
curl -I http://localhost:8000/api/v1/ 2>&1
echo ""

echo "5. Checking if frontend is responding..."
curl -I http://localhost:3000 2>&1
echo ""

echo "6. Testing backend auth endpoint..."
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' 2>&1
echo ""

echo "=== Debug Complete ==="
echo "Please check the output above for specific errors"

# Made with Bob
