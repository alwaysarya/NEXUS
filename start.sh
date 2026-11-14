#!/bin/bash

# NEXUS Startup Script

echo "🚀 Starting NEXUS Infrastructure..."

# 1. Set Environment Variables
export DATABASE_URL="postgres://atlas:atlas@localhost:5432/nexus?sslmode=disable"
echo "✅ Environment variables set."

# 2. Start Control Plane (Backend)
echo "⚙️  Starting Control Plane on :8080..."
cd services/control-plane
go run cmd/atlas-controller/main.go > /dev/null 2>&1 &
BACKEND_PID=$!
cd ../..

# 3. Start Frontend (Dashboard)
echo "💻 Starting Dashboard on :5173..."
cd web/apps/dashboard
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ../..

# 4. Start Node Agent (Local node)
echo "🤖 Starting Node Agent..."
cd services/node-agent
go run cmd/atlas-agent/main.go > /dev/null 2>&1 &
AGENT_PID=$!
cd ../..

echo "---------------------------------------------------"
echo "🎉 NEXUS is UP and RUNNING!"
echo "Dashboard: http://localhost:5173"
echo "Backend API: http://localhost:8080"
echo "---------------------------------------------------"
echo "Press Ctrl+C to stop all services."

# Handle Ctrl+C to kill background processes
trap "echo -e '\n🛑 Stopping NEXUS...'; kill $BACKEND_PID $FRONTEND_PID $AGENT_PID; exit" INT
wait
