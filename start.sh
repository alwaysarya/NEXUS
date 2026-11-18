#!/bin/bash

ROOT_DIR="/Users/aryanthakur/Documents/COLLEGE/V SEM/Cloud computing/NEXUS"
cd "$ROOT_DIR" || exit

echo "🚀 Starting NEXUS Infrastructure..."

# 0. Start Kubernetes Cluster
echo "☸️  Starting Kubernetes Cluster..."
if ! docker ps | grep -q "nexus-cluster-control-plane"; then
  kind create cluster --name nexus-cluster || docker start nexus-cluster-control-plane
fi
kubectl wait --for=condition=Ready nodes --all --timeout=60s

if ! kubectl get deployment nginx-app > /dev/null 2>&1; then
  kubectl create deployment nginx-app --image=nginx --replicas=3
  kubectl create deployment api-service --image=hashicorp/http-echo -- /http-echo -text="hello"
fi

# 1. Python AI API
echo "🧠 Starting AI Intelligence API on :8000..."
source venv/bin/activate
python3 intelligence/api.py &
AI_PID=$!

# 2. Go Backend
echo "⚙️  Starting Control Plane on :8080..."
export DATABASE_URL="postgres://atlas:atlas@localhost:5432/nexus?sslmode=disable"
go run services/control-plane/cmd/atlas-controller/main.go &
BACKEND_PID=$!

# 3. Prometheus & Grafana
echo "📊 Starting Prometheus & Grafana..."
docker compose -f docker-compose.monitoring.yml up -d

# 4. Frontend Dashboard
echo "💻 Starting Dashboard on :5173..."
cd "$ROOT_DIR/web/apps/dashboard" || exit
npm run dev &
FRONTEND_PID=$!
cd "$ROOT_DIR" || exit

echo "---------------------------------------------------"
echo "🎉 NEXUS is UP and RUNNING!"
echo "Dashboard: http://localhost:5173"
echo "---------------------------------------------------"

trap "echo -e '\n🛑 Stopping NEXUS...'; kill $BACKEND_PID $FRONTEND_PID $AI_PID 2>/dev/null; docker compose -f docker-compose.monitoring.yml down; exit" INT
wait
