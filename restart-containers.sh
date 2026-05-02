#!/bin/bash

echo "Stopping Docker containers..."
docker compose down

echo "Removing any existing containers..."
docker rm -f crafterslink-db crafterslink-backend crafterslink-frontend 2>/dev/null || true

echo "Starting Docker containers with new configuration..."
docker compose up -d

echo "Waiting for database to be ready..."
sleep 10

echo "Checking backend logs..."
docker compose logs backend | tail -30

echo ""
echo "Container status:"
docker compose ps

echo ""
echo "If backend is not running, check full logs with:"
echo "sudo docker compose logs backend"

# Made with Bob
