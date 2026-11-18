#!/bin/bash
echo "🛑 Stopping old NEXUS services..."

# Ports kill karo
kill $(lsof -t -i:8080) 2>/dev/null
kill $(lsof -t -i:5173) 2>/dev/null
kill $(lsof -t -i:8000) 2>/dev/null
kill $(lsof -t -i:9091) 2>/dev/null
kill $(lsof -t -i:3001) 2>/dev/null

# Processes kill karo
pkill -f "atlas-controller" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "intelligence/api.py" 2>/dev/null

# Docker containers band karo
# docker compose -f docker-compose.monitoring.yml down > /dev/null 2>&1

sleep 2

echo "🚀 Restarting NEXUS..."
./start.sh
