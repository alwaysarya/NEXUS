#!/bin/bash
ROOT_DIR="/Users/aryanthakur/Documents/COLLEGE/V SEM/Cloud computing/NEXUS"
cd "$ROOT_DIR" || exit

echo "🚀 Starting NEXUS Infrastructure..."
export DATABASE_URL="postgres://atlas:atlas@localhost:5432/nexus?sslmode=disable"

echo "⚙️  Starting Control Plane on :8080..."
cd "$ROOT_DIR/services/control-plane" || exit
go run cmd/atlas-controller/main.go &
BACKEND_PID=$!
cd "$ROOT_DIR" || exit

echo "💻 Starting Dashboard on :5173..."
cd "$ROOT_DIR/web/apps/dashboard" || exit
npm run dev &
FRONTEND_PID=$!
cd "$ROOT_DIR" || exit

echo "🤖 Starting Node Agent..."
cd "$ROOT_DIR/services/node-agent" || exit
sleep 2 
go run cmd/atlas-agent/main.go &
AGENT_PID=$!
cd "$ROOT_DIR" || exit

echo "---------------------------------------------------"
echo "🎉 NEXUS is UP and RUNNING!"
echo "Dashboard: http://localhost:5173"
echo "Backend API: http://localhost:8080"
echo "---------------------------------------------------"
echo "Press Ctrl+C to stop all services."

trap "echo -e '\n🛑 Stopping NEXUS...'; kill $BACKEND_PID $FRONTEND_PID $AGENT_PID; exit" INT
wait
