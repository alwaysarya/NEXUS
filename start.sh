#!/bin/bash
echo "🚀 Starting NEXUS Infrastructure..."
export DATABASE_URL="postgres://atlas:atlas@localhost:5432/nexus?sslmode=disable"

echo "⚙️  Starting Control Plane on :8080..."
cd services/control-plane || exit
go run cmd/atlas-controller/main.go &
BACKEND_PID=$!
cd ../..

echo "💻 Starting Dashboard on :5173..."
cd web/apps/dashboard || exit
npm run dev &
FRONTEND_PID=$!
cd ../..

# (Node Agent ko abhi ke liye hata diya hai taaki error na aaye)
# echo "🤖 Starting Node Agent..."
# cd services/node-agent || exit
# go run cmd/atlas-agent/main.go &
# AGENT_PID=$!
# cd ../..

echo "---------------------------------------------------"
echo "🎉 NEXUS is UP and RUNNING!"
echo "Dashboard: http://localhost:5173"
echo "Backend API: http://localhost:8080"
echo "---------------------------------------------------"
echo "Press Ctrl+C to stop all services."
trap "echo -e '\n🛑 Stopping NEXUS...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
