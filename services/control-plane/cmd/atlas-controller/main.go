package main

import (
	"fmt"
	"log"
	"net/http"
	"github.com/alwaysarya/nexus/services/control-plane/internal/api"
	"github.com/alwaysarya/nexus/services/control-plane/internal/database"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" { w.WriteHeader(http.StatusOK); return }
		next.ServeHTTP(w, r)
	})
}

func main() {
	database.Connect()

	mux := http.NewServeMux()
	
	mux.Handle("/metrics", promhttp.Handler())
	mux.HandleFunc("/api/real-metrics", api.RealMetricsHandler)
	mux.HandleFunc("/api/aws-metrics", api.AWSHandler)
	mux.HandleFunc("/api/gcp-metrics", api.GCPHandler)
	mux.HandleFunc("/api/azure-metrics", api.AzureHandler)
	mux.HandleFunc("/api/traffic-metrics", api.TrafficHistoryHandler)
	mux.HandleFunc("/api/security-metrics", api.SecurityMetricsHandler)
	mux.HandleFunc("/api/network-metrics", api.NetworkMetricsHandler)
	mux.HandleFunc("/api/storage-metrics", api.StorageMetricsHandler)
	
	// Clusters Route
	mux.HandleFunc("/api/clusters", api.ClustersHandler)
	mux.HandleFunc("/api/workloads", api.WorkloadsHandler)
	mux.HandleFunc("/api/deployments", api.DeploymentsPageHandler)
	mux.HandleFunc("/api/deploy-action", api.DeployActionHandler)
	mux.HandleFunc("/api/create-release", api.CreateReleaseHandler)

	// Dummy routes for other pages
	mux.HandleFunc("/api/nodes", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("[]")) })
	mux.HandleFunc("/api/networking", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("[]")) })
	mux.HandleFunc("/api/storage", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("[]")) })
	mux.HandleFunc("/api/cost", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("{}")) })
	mux.HandleFunc("/api/automation", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("[]")) })
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte(`{"status":"ok"}`)) })

	handler := CORS(mux)
	fmt.Println("🚀 Control Plane running on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
