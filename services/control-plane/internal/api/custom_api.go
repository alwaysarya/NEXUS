package api

import (
	"encoding/json"
	"net/http"
)

type NodeData struct {
	Name         string  `json:"name"`
	Status       string  `json:"status"`
	Zone         string  `json:"zone"`
	InstanceType string  `json:"instanceType"`
	CPU          float64 `json:"cpu"`
	Memory       float64 `json:"memory"`
	Pods         string  `json:"pods"`
	Age          string  `json:"age"`
}

type DeploymentData struct {
	Release     string `json:"release"`
	Environment string `json:"environment"`
	Status      string `json:"status"`
	DeployedAt  string `json:"deployedAt"`
	Duration    string `json:"duration"`
}

type WorkloadData struct {
	Name      string `json:"name"`
	Type      string `json:"type"`
	Namespace string `json:"namespace"`
	Status    string `json:"status"`
	Replicas  string `json:"replicas"`
	CPU       string `json:"cpu"`
	Memory    string `json:"memory"`
	Age       string `json:"age"`
}

type NetworkingData struct {
	Name   string `json:"name"`
	Type   string `json:"type"`
	Target string `json:"target"`
	Status string `json:"status"`
}

type StorageData struct {
	Name      string `json:"name"`
	Capacity  string `json:"capacity"`
	Access    string `json:"access"`
	Status    string `json:"status"`
	Class     string `json:"class"`
}

type CostData struct {
	Service string  `json:"service"`
	Cost    float64 `json:"cost"`
	Usage   string  `json:"usage"`
}

type AutomationData struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Schedule string `json:"schedule"`
	Status   string `json:"status"`
	LastRun  string `json:"lastRun"`
}

func CustomHealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy", "uptime": "99.98%"})
}

func CustomNodesHandler(w http.ResponseWriter, r *http.Request) {
	nodes := []NodeData{
		{Name: "ip-10-0-1-23", Status: "Ready", Zone: "us-east-1a", InstanceType: "m6i.2xlarge", CPU: 38, Memory: 61, Pods: "14 / 32", Age: "4 mo"},
		{Name: "ip-10-0-1-24", Status: "Ready", Zone: "us-east-1a", InstanceType: "m6i.2xlarge", CPU: 41, Memory: 63, Pods: "13 / 32", Age: "4 mo"},
		{Name: "ip-10-0-2-20", Status: "NotReady", Zone: "us-east-1b", InstanceType: "m6i.2xlarge", CPU: 0, Memory: 0, Pods: "0 / 32", Age: "12 min"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nodes)
}

func DeploymentsHandler(w http.ResponseWriter, r *http.Request) {
	deployments := []DeploymentData{
		{Release: "v2.8.4", Environment: "Production", Status: "Deploying", DeployedAt: "Jun 20, 2025, 10:24 AM", Duration: "—"},
		{Release: "v2.8.3", Environment: "Production", Status: "Succeeded", DeployedAt: "Jun 18, 2025, 9:12 PM", Duration: "7m 18s"},
		{Release: "v2.8.2", Environment: "Production", Status: "Succeeded", DeployedAt: "Jun 15, 2025, 4:06 PM", Duration: "6m 47s"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(deployments)
}

func WorkloadsHandler(w http.ResponseWriter, r *http.Request) {
	workloads := []WorkloadData{
		{Name: "nexus-api", Type: "Deployment", Namespace: "production", Status: "Running", Replicas: "4/4", CPU: "38%", Memory: "56%", Age: "4mo"},
		{Name: "auth-service", Type: "Deployment", Namespace: "production", Status: "Running", Replicas: "3/3", CPU: "22%", Memory: "41%", Age: "4mo"},
		{Name: "postgres-db", Type: "StatefulSet", Namespace: "production", Status: "Running", Replicas: "1/1", CPU: "45%", Memory: "72%", Age: "4mo"},
		{Name: "redis-cache", Type: "StatefulSet", Namespace: "production", Status: "Running", Replicas: "1/1", CPU: "12%", Memory: "34%", Age: "4mo"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workloads)
}

func NetworkingHandler(w http.ResponseWriter, r *http.Request) {
	networking := []NetworkingData{
		{Name: "api.nexus.io", Type: "ALB", Target: "api-gateway:80", Status: "Active"},
		{Name: "grafana.nexus.io", Type: "ALB", Target: "grafana:3000", Status: "Active"},
		{Name: "argocd.nexus.io", Type: "ALB", Target: "argocd-server:443", Status: "Active"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(networking)
}

func StorageHandler(w http.ResponseWriter, r *http.Request) {
	storage := []StorageData{
		{Name: "pvc-postgres-data", Capacity: "500 GiB", Access: "ReadWriteOnce", Status: "Bound", Class: "gp3"},
		{Name: "pvc-redis-data", Capacity: "100 GiB", Access: "ReadWriteOnce", Status: "Bound", Class: "gp3"},
		{Name: "pvc-prometheus-data", Capacity: "1 TiB", Access: "ReadWriteMany", Status: "Bound", Class: "efs"},
		{Name: "pvc-grafana-data", Capacity: "50 GiB", Access: "ReadWriteOnce", Status: "Bound", Class: "gp3"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(storage)
}

func CostHandler(w http.ResponseWriter, r *http.Request) {
	costs := []CostData{
		{Service: "EC2 Instances", Cost: 450.00, Usage: "12 instances"},
		{Service: "EKS Cluster", Cost: 200.00, Usage: "1 cluster"},
		{Service: "RDS (Postgres)", Cost: 400.00, Usage: "2 instances"},
		{Service: "S3 Storage", Cost: 150.00, Usage: "5.8 TB"},
		{Service: "EBS Volumes", Cost: 100.00, Usage: "1.2 TB"},
		{Service: "Data Transfer", Cost: 150.00, Usage: "450 GB"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(costs)
}

func AutomationHandler(w http.ResponseWriter, r *http.Request) {
	automation := []AutomationData{
		{ID: "SCR-001", Name: "Scale Cluster Nodes", Schedule: "Every 5 min", Status: "Active", LastRun: "2 mins ago"},
		{ID: "SCR-002", Name: "Database Backup", Schedule: "Daily at 02:00 AM", Status: "Active", LastRun: "6 hrs ago"},
		{ID: "SCR-003", Name: "Cleanup Old Logs", Schedule: "Weekly (Sun)", Status: "Paused", LastRun: "3 days ago"},
		{ID: "SCR-004", Name: "Rotate Secrets", Schedule: "Every 30 days", Status: "Active", LastRun: "12 days ago"},
		{ID: "SCR-005", Name: "Security Patch Update", Schedule: "Monthly", Status: "Active", LastRun: "1 month ago"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(automation)
}
