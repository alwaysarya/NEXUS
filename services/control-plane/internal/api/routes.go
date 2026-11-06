package api

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"
)

const heartbeatTimeout = 30 * time.Second

type HealthResponse struct {
	Status    string    `json:"status"`
	Service   string    `json:"service"`
	Timestamp time.Time `json:"timestamp"`
}

type Node struct {
	ID                string     `json:"id"`
	Hostname          string     `json:"hostname"`
	CPUCores          int        `json:"cpu_cores"`
	MemoryMB          int64      `json:"memory_mb"`
	AllocatedCPUCores int        `json:"allocated_cpu_cores"`
	AllocatedMemoryMB int64      `json:"allocated_memory_mb"`
	AvailableCPUCores int        `json:"available_cpu_cores"`
	AvailableMemoryMB int64      `json:"available_memory_mb"`
	Status            string     `json:"status"`
	RegisteredAt      time.Time  `json:"registered_at"`
	LastHeartbeat     *time.Time `json:"last_heartbeat"`
}

type RegisterNodeRequest struct {
	ID       string `json:"id"`
	Hostname string `json:"hostname"`
	CPUCores int    `json:"cpu_cores"`
	MemoryMB int64  `json:"memory_mb"`
}

type NodeRegistry struct {
	mu    sync.RWMutex
	nodes map[string]Node
}

func NewNodeRegistry() *NodeRegistry {
	return &NodeRegistry{
		nodes: make(map[string]Node),
	}
}

func RegisterRoutes(mux *http.ServeMux, nodeAPI *NodeAPI) {
	mux.HandleFunc("GET /health", healthHandler)
	mux.HandleFunc("GET /api/v1/status", statusHandler)
	mux.HandleFunc("POST /api/v1/nodes", nodeAPI.registerNodeHandler)
	mux.HandleFunc("GET /api/v1/nodes", nodeAPI.listNodesHandler)
	mux.HandleFunc("POST /api/v1/nodes/{id}/heartbeat", nodeAPI.heartbeatHandler)
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, HealthResponse{
		Status:    "healthy",
		Service:   "nexus-control-plane",
		Timestamp: time.Now().UTC(),
	})
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"platform": "NEXUS",
		"service":  "control-plane",
		"version":  "0.1.0",
		"status":   "running",
	})
}

func (registry *NodeRegistry) registerNodeHandler(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	var request RegisterNodeRequest

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&request); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON request")
		return
	}

	var extra any
	if err := decoder.Decode(&extra); !errors.Is(err, io.EOF) {
		writeError(w, http.StatusBadRequest, "request must contain one JSON object")
		return
	}

	request.ID = strings.TrimSpace(request.ID)
	request.Hostname = strings.TrimSpace(request.Hostname)

	if request.ID == "" || request.Hostname == "" {
		writeError(w, http.StatusBadRequest, "node ID and hostname are required")
		return
	}

	if len(request.ID) > 128 || len(request.Hostname) > 255 {
		writeError(w, http.StatusBadRequest, "node ID or hostname is too long")
		return
	}

	if request.CPUCores < 1 || request.CPUCores > 4096 {
		writeError(w, http.StatusBadRequest, "CPU cores must be between 1 and 4096")
		return
	}

	if request.MemoryMB < 1 || request.MemoryMB > 1<<40 {
		writeError(w, http.StatusBadRequest, "memory must be a positive value")
		return
	}

	registry.mu.Lock()
	defer registry.mu.Unlock()

	if _, exists := registry.nodes[request.ID]; exists {
		writeError(w, http.StatusConflict, "node ID already registered")
		return
	}

	node := Node{
		ID:           request.ID,
		Hostname:     request.Hostname,
		CPUCores:     request.CPUCores,
		MemoryMB:     request.MemoryMB,
		Status:       "registered",
		RegisteredAt: time.Now().UTC(),
	}

	registry.nodes[node.ID] = node
	writeJSON(w, http.StatusCreated, node)
}

func (registry *NodeRegistry) heartbeatHandler(w http.ResponseWriter, r *http.Request) {
	nodeID := r.PathValue("id")

	registry.mu.Lock()
	defer registry.mu.Unlock()

	node, exists := registry.nodes[nodeID]
	if !exists {
		writeError(w, http.StatusNotFound, "node not found")
		return
	}

	now := time.Now().UTC()
	node.Status = "online"
	node.LastHeartbeat = &now

	registry.nodes[nodeID] = node

	writeJSON(w, http.StatusOK, map[string]any{
		"message":        "heartbeat received",
		"node_id":        node.ID,
		"status":         node.Status,
		"last_heartbeat": now,
	})
}

func (registry *NodeRegistry) listNodesHandler(w http.ResponseWriter, r *http.Request) {
	registry.mu.RLock()
	defer registry.mu.RUnlock()

	now := time.Now().UTC()
	nodes := make([]Node, 0, len(registry.nodes))

	for _, node := range registry.nodes {
		if node.LastHeartbeat != nil {
			if now.Sub(*node.LastHeartbeat) > heartbeatTimeout {
				node.Status = "offline"
			} else {
				node.Status = "online"
			}
		}

		nodes = append(nodes, node)
	}

	sort.Slice(nodes, func(i, j int) bool {
		return nodes[i].ID < nodes[j].ID
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"count": len(nodes),
		"nodes": nodes,
	})
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{
		"error": message,
	})
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}

// StartMonitor periodically checks node heartbeat timestamps.
func (registry *NodeRegistry) StartMonitor(
	ctx context.Context,
	interval time.Duration,
	timeout time.Duration,
) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case now := <-ticker.C:
			registry.refreshStatuses(now.UTC(), timeout)
		}
	}
}

// refreshStatuses marks nodes offline when their heartbeat expires.
func (registry *NodeRegistry) refreshStatuses(
	now time.Time,
	timeout time.Duration,
) {
	registry.mu.Lock()
	defer registry.mu.Unlock()

	for id, node := range registry.nodes {
		lastSeen := node.RegisteredAt

		if node.LastHeartbeat != nil {
			lastSeen = *node.LastHeartbeat
		}

		if now.Sub(lastSeen) > timeout {
			node.Status = "offline"
		} else if node.LastHeartbeat != nil {
			node.Status = "online"
		}

		registry.nodes[id] = node
	}
}
