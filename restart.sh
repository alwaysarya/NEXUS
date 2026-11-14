#!/bin/bash
echo "🛑 Stopping old NEXUS services..."
kill $(lsof -t -i:8080) 2>/dev/null
kill $(lsof -t -i:5173) 2>/dev/null
kill $(lsof -t -i:8000) 2>/dev/null
pkill -f "atlas-controller" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "intelligence/api.py" 2>/dev/null

echo "🐳 Stopping Docker containers..."
docker compose -f deployments/docker/docker-compose.dev.yml down

sleep 2

echo "🚀 Starting NEXUS via Docker..."
docker compose -f deployments/docker/docker-compose.dev.yml up
