package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	"github.com/alwaysarya/nexus/services/control-plane/internal/api"
	"github.com/alwaysarya/nexus/services/control-plane/internal/auth"
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

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" { http.Error(w, "Unauthorized", http.StatusUnauthorized); return }
		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)
		if _, err := auth.ValidateToken(tokenString); err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized); return
		}
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

	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("/api/nodes", api.CustomNodesHandler)
	protectedMux.HandleFunc("/api/predict", api.AIPredictHandler)
	protectedMux.HandleFunc("/api/deployments", api.DeploymentsHandler)
	protectedMux.HandleFunc("/api/workloads", api.WorkloadsHandler)
	protectedMux.HandleFunc("/api/networking", api.NetworkingHandler)
	protectedMux.HandleFunc("/api/storage", api.StorageHandler)
	protectedMux.HandleFunc("/api/cost", api.CostHandler)
	protectedMux.HandleFunc("/api/automation", api.AutomationHandler)
	protectedMux.HandleFunc("/api/real-metrics", api.RealMetricsHandler)
	protectedMux.HandleFunc("/api/network-metrics", api.NetworkMetricsHandler)
	protectedMux.HandleFunc("/api/storage-metrics", api.StorageMetricsHandler)
	protectedMux.HandleFunc("/api/observability-metrics", api.ObservabilityMetricsHandler)
	protectedMux.HandleFunc("/api/automation-metrics", api.AutomationMetricsHandler)
	protectedMux.HandleFunc("/api/traces-metrics", api.TracesMetricsHandler)
	protectedMux.HandleFunc("/api/alerts-metrics", api.AlertsMetricsHandler)
	protectedMux.HandleFunc("/api/security-metrics", api.SecurityMetricsHandler) // Naya security route
	mux.Handle("/api/", AuthMiddleware(protectedMux))

	handler := CORS(mux)
	fmt.Println("🚀 Control Plane running on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
