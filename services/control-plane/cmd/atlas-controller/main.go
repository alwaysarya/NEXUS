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
        mux.HandleFunc("/api/login", api.LoginHandler)
        mux.HandleFunc("/api/register", api.RegisterHandler)
        mux.HandleFunc("/api/health", api.CustomHealthHandler)
        mux.Handle("/metrics", promhttp.Handler())

        mux.HandleFunc("/api/aws-metrics", api.AWSHandler)
        mux.HandleFunc("/api/gcp-metrics", api.GCPHandler)
        mux.HandleFunc("/api/azure-metrics", api.AzureHandler)

        mux.HandleFunc("/api/nodes", api.CustomNodesHandler)
        mux.HandleFunc("/api/predict", api.AIPredictHandler)
        
        // NEW DEPLOYMENTS ROUTE
        mux.HandleFunc("/api/deployments", api.GitHubDeploymentsHandler)
        
        mux.HandleFunc("/api/workloads", api.WorkloadsHandler)
        mux.HandleFunc("/api/networking", api.NetworkingHandler)
        mux.HandleFunc("/api/storage", api.StorageHandler)
        mux.HandleFunc("/api/cost", api.CostHandler)
        mux.HandleFunc("/api/automation", api.AutomationHandler)
        mux.HandleFunc("/api/real-metrics", api.RealMetricsHandler)
        mux.HandleFunc("/api/network-metrics", api.NetworkMetricsHandler)
        mux.HandleFunc("/api/storage-metrics", api.StorageMetricsHandler)
        mux.HandleFunc("/api/observability-metrics", api.ObservabilityMetricsHandler)
        mux.HandleFunc("/api/automation-metrics", api.AutomationMetricsHandler)
        mux.HandleFunc("/api/traces-metrics", api.TracesMetricsHandler)
        mux.HandleFunc("/api/alerts-metrics", api.AlertsMetricsHandler)
        mux.HandleFunc("/api/security-metrics", api.SecurityMetricsHandler)
        mux.HandleFunc("/api/cost-metrics", api.CostMetricsHandler)
        mux.HandleFunc("/api/traffic-metrics", api.TrafficHistoryHandler)

        handler := CORS(mux)
        fmt.Println("🚀 Control Plane running on :8080")
        log.Fatal(http.ListenAndServe(":8080", handler))
}
