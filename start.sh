#!/bin/bash

ROOT_DIR="/Users/aryanthakur/Documents/COLLEGE/V SEM/Cloud computing/NEXUS"
cd "$ROOT_DIR" || exit

echo "🚀 Starting NEXUS Infrastructure..."

# 0. Start Kubernetes Cluster & Deployments
echo "☸️  Starting Kubernetes Cluster..."
if ! docker ps | grep -q "nexus-cluster-control-plane"; then
  kind create cluster --name nexus-cluster || docker start nexus-cluster-control-plane
fi

echo "⏳ Waiting for K8s API to be ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=60s

# Ensure deployments are applied (Idempotent)
if ! kubectl get deployment nginx-app > /dev/null 2>&1; then
  kubectl create deployment nginx-app --image=nginx --replicas=3
fi
if ! kubectl get deployment api-service > /dev/null 2>&1; then
  kubectl create deployment api-service --image=hashicorp/http-echo -- /http-echo -text="hello"
fi

# Background monitor (optional, logs to file)
echo "📊 Monitoring K8s pods in background..."
kubectl get pods -w > .nexus/k8s-watch.log 2>&1 &

# 1. Python AI API start karo
echo "🧠 Starting AI Intelligence API on :8000..."
source venv/bin/activate
python3 intelligence/api.py > .nexus/logs/ai.log 2>&1 &
AI_PID=$!

# 2. Go Backend start karo
echo "⚙️  Starting Control Plane on :8080..."
export DATABASE_URL="postgres://atlas:atlas@localhost:5432/nexus?sslmode=disable"
go run services/control-plane/cmd/atlas-controller/main.go > .nexus/logs/control-plane.log 2>&1 &
BACKEND_PID=$!

# 3. Prometheus & Grafana start karo
echo "📊 Starting Prometheus & Grafana..."
docker compose -f docker-compose.monitoring.yml up -d > /dev/null 2>&1

# 4. Frontend Dashboard start karo
echo "💻 Starting Dashboard on :5173..."
cd "$ROOT_DIR/web/apps/dashboard" || exit
npm run dev > .nexus/logs/dashboard.log 2>&1 &
FRONTEND_PID=$!
cd "$ROOT_DIR" || exit

echo "---------------------------------------------------"
echo "🎉 NEXUS is UP and RUNNING!"
echo "Dashboard: http://localhost:5173"
echo "Backend API: http://localhost:8080"
echo "AI Engine: http://localhost:8000"
echo "Prometheus: http://localhost:9091"
echo "Grafana: http://localhost:3001"
echo "K8s Watch Log: .nexus/k8s-watch.log"
echo "---------------------------------------------------"

trap "echo -e '\n🛑 Stopping NEXUS...'; kill $BACKEND_PID $FRONTEND_PID $AI_PID 2>/dev/null; docker compose -f docker-compose.monitoring.yml down; exit" INT
wait
