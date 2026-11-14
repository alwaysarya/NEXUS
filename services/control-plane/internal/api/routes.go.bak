package api

import (
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux, h *Handlers, w *WorkloadHandler, auth *AuthHandler, health *HealthHandler, metrics *MetricsHandler, agent *AgentHandler, system *SystemHandler, apikey *APIKeyHandler) {
	mux.HandleFunc("POST /api/v1/register", auth.Register)
	mux.HandleFunc("POST /api/v1/login", auth.Login)
	mux.HandleFunc("GET /health/live", health.Live)
	mux.HandleFunc("GET /health/ready", health.Ready)
	mux.HandleFunc("GET /metrics", metrics.ServeMetrics)

	mux.HandleFunc("POST /api/v1/nodes", AuthMiddleware(AdminOnly(h.RegisterNode)))
	mux.HandleFunc("GET /api/v1/nodes", AuthMiddleware(h.ListNodes))
	mux.HandleFunc("GET /api/v1/nodes/{id}", AuthMiddleware(h.GetNode))
	mux.HandleFunc("PATCH /api/v1/nodes/{id}/status", AuthMiddleware(AdminOnly(h.UpdateNodeStatus)))
	mux.HandleFunc("DELETE /api/v1/nodes/{id}", AuthMiddleware(AdminOnly(h.DeleteNode)))
	mux.HandleFunc("GET /api/v1/nodes/{id}/workloads", AuthMiddleware(w.GetNodeWorkloads))

	mux.HandleFunc("POST /api/v1/workloads", AuthMiddleware(AdminOnly(w.CreateWorkload)))
	mux.HandleFunc("GET /api/v1/workloads", AuthMiddleware(w.ListWorkloads))
	mux.HandleFunc("POST /api/v1/workloads/{id}/schedule", AuthMiddleware(AdminOnly(w.ScheduleWorkload)))

	mux.HandleFunc("GET /api/v1/system/stats", AuthMiddleware(system.GetSystemStats))
	mux.HandleFunc("POST /api/v1/agent/token", AuthMiddleware(AdminOnly(agent.GenerateAgentToken)))

	mux.HandleFunc("POST /api/v1/api-keys", AuthMiddleware(AdminOnly(apikey.GenerateKey)))
}
