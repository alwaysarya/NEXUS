#!/bin/bash
echo "🛑 Stopping old NEXUS services..."
kill $(lsof -t -i:8080) 2>/dev/null
kill $(lsof -t -i:5173) 2>/dev/null
pkill -f "atlas-agent" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 2

echo "🧹 Cleaning up old data..."
psql -d nexus -c "TRUNCATE nodes, workloads CASCADE;" > /dev/null 2>&1

echo "🚀 Restarting NEXUS..."
./start.sh
