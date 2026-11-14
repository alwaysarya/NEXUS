package api

import (
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux, h *Handlers, w *WorkloadHandler) {
	// Node Routes
	mux.HandleFunc("POST /api/v1/nodes", h.RegisterNode)
	mux.HandleFunc("GET /api/v1/nodes", h.ListNodes)
	mux.HandleFunc("GET /api/v1/nodes/{id}", h.GetNode)
	mux.HandleFunc("PATCH /api/v1/nodes/{id}/status", h.UpdateNodeStatus)
	mux.HandleFunc("DELETE /api/v1/nodes/{id}", h.DeleteNode)

	// Workload Routes
	mux.HandleFunc("POST /api/v1/workloads", w.CreateWorkload)
	mux.HandleFunc("GET /api/v1/workloads", w.ListWorkloads)
	mux.HandleFunc("POST /api/v1/workloads/{id}/schedule", w.ScheduleWorkload)
}
