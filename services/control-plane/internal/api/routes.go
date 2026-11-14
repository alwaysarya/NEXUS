package api

import (
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux, h *Handlers, w *WorkloadHandler, auth *AuthHandler, health *HealthHandler, metrics *MetricsHandler) {
	// Public Routes
	mux.HandleFunc("POST /api/v1/register", auth.Register)
	mux.HandleFunc("POST /api/v1/login", auth.Login)
	mux.HandleFunc("GET /health/live", health.Live)
	mux.HandleFunc("GET /health/ready", health.Ready)
	mux.HandleFunc("GET /metrics", metrics.ServeMetrics)

	// Protected Routes
	mux.HandleFunc("POST /api/v1/nodes", AuthMiddleware(h.RegisterNode))
	mux.HandleFunc("GET /api/v1/nodes", AuthMiddleware(h.ListNodes))
	mux.HandleFunc("GET /api/v1/nodes/{id}", AuthMiddleware(h.GetNode))
	mux.HandleFunc("PATCH /api/v1/nodes/{id}/status", AuthMiddleware(h.UpdateNodeStatus))
	mux.HandleFunc("DELETE /api/v1/nodes/{id}", AuthMiddleware(h.DeleteNode))
	mux.HandleFunc("GET /api/v1/nodes/{id}/workloads", AuthMiddleware(w.GetNodeWorkloads))

	mux.HandleFunc("POST /api/v1/workloads", AuthMiddleware(w.CreateWorkload))
	mux.HandleFunc("GET /api/v1/workloads", AuthMiddleware(w.ListWorkloads))
	mux.HandleFunc("POST /api/v1/workloads/{id}/schedule", AuthMiddleware(w.ScheduleWorkload))
}
