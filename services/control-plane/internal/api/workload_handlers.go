package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/alwaysarya/nexus/services/control-plane/internal/node_registry"
	"github.com/alwaysarya/nexus/services/control-plane/internal/scheduler"
	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
	"github.com/google/uuid"
)

type WorkloadHandler struct {
	repo      storage.WorkloadRepository
	scheduler *scheduler.Scheduler
}

func NewWorkloadHandler(repo storage.WorkloadRepository, sched *scheduler.Scheduler) *WorkloadHandler {
	return &WorkloadHandler{repo: repo, scheduler: sched}
}

func (h *WorkloadHandler) CreateWorkload(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name           string `json:"name"`
		Image          string `json:"image"`
		CPURequired    int    `json:"cpu_required"`
		MemoryRequired int64  `json:"memory_required"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}
	wl := &node_registry.Workload{
		ID: uuid.New(), Name: req.Name, Image: req.Image, Status: node_registry.WorkloadPending,
		CPURequired: req.CPURequired, MemoryRequired: req.MemoryRequired, CreatedAt: time.Now(),
	}
	if err := h.repo.Create(r.Context(), wl); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(wl)
}

func (h *WorkloadHandler) ScheduleWorkload(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	if err := h.scheduler.Schedule(r.Context(), idStr); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "workload scheduled successfully"}`))
}

func (h *WorkloadHandler) ListWorkloads(w http.ResponseWriter, r *http.Request) {
	workloads, err := h.repo.List(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workloads)
}

// NAYA FUNCTION: Agent isko call karega apne tasks lene ke liye
func (h *WorkloadHandler) GetNodeWorkloads(w http.ResponseWriter, r *http.Request) {
	nodeIDStr := r.PathValue("id")
	nodeID, err := uuid.Parse(nodeIDStr)
	if err != nil {
		http.Error(w, "invalid node UUID", http.StatusBadRequest)
		return
	}
	workloads, err := h.repo.GetByNodeID(r.Context(), nodeID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(workloads)
}
