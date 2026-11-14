package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/alwaysarya/nexus/services/control-plane/internal/node_registry"
	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
	"github.com/google/uuid"
)

type Handlers struct {
	nodeRepo storage.NodeRepository
}

func NewHandlers(repo storage.NodeRepository) *Handlers {
	return &Handlers{nodeRepo: repo}
}

func (h *Handlers) RegisterNode(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Hostname  string `json:"hostname"`
		IPAddress string `json:"ip_address"`
		CPUCores  int    `json:"cpu_cores"`
		MemoryMB  int64  `json:"memory_mb"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	now := time.Now()
	n := &node_registry.Node{
		ID:        uuid.New(),
		Hostname:  req.Hostname,
		IPAddress: req.IPAddress,
		Status:    node_registry.StatusPending,
		CPUCores:  req.CPUCores,
		MemoryMB:  req.MemoryMB,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if err := h.nodeRepo.Create(r.Context(), n); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(n)
}

func (h *Handlers) GetNode(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid UUID", http.StatusBadRequest)
		return
	}

	n, err := h.nodeRepo.GetByID(r.Context(), id)
	if err != nil {
		http.Error(w, "node not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(n)
}

func (h *Handlers) UpdateNodeStatus(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid UUID", http.StatusBadRequest)
		return
	}

	var req struct {
		Status node_registry.NodeStatus `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if err := h.nodeRepo.UpdateStatus(r.Context(), id, req.Status); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message": "status updated successfully"}`))
}
