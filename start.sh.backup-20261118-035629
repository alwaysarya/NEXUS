#!/bin/bash

ROOT_DIR="/Users/aryanthakur/Documents/COLLEGE/V SEM/Cloud computing/NEXUS"
cd "$ROOT_DIR" || exit

echo "🚀 Starting NEXUS Infrastructure..."

# 1. Python AI API start karo
echo "🧠 Starting AI Intelligence API on :8000..."
source venv/bin/activate
python3 intelligence/api.py &
AI_PID=$!

# 2. Go Backend start karo
echo "⚙️  Starting Control Plane on :8080..."
export DATABASE_URL="postgres://atlas:atlas@localhost:5432/nexus?sslmode=disable"
go run services/control-plane/cmd/atlas-controller/main.go &
BACKEND_PID=$!

# 3. Prometheus & Grafana start karo
echo "📊 Starting Prometheus & Grafana..."
docker compose -f docker-compose.monitoring.yml up -d

# 4. Frontend Dashboard start karo
echo "💻 Starting Dashboard on :5173..."
cd "$ROOT_DIR/web/apps/dashboard" || exit
npm run dev &
FRONTEND_PID=$!
cd "$ROOT_DIR" || exit

echo "---------------------------------------------------"
echo "🎉 NEXUS is UP and RUNNING!"
echo "Dashboard: http://localhost:5173"
echo "Backend API: http://localhost:8080"
echo "AI Engine: http://localhost:8000"
echo "Prometheus: http://localhost:9091"
echo "Grafana: http://localhost:3001"
echo "---------------------------------------------------"

trap "echo -e '\n🛑 Stopping NEXUS...'; kill $BACKEND_PID $FRONTEND_PID $AI_PID 2>/dev/null; docker compose -f docker-compose.monitoring.yml down; exit" INT
wait
