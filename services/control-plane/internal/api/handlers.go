package api

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
)

func (api *NodeAPI) registerNodeHandler(w http.ResponseWriter, r *http.Request) {
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

	node := Node{
		ID:           request.ID,
		Hostname:     request.Hostname,
		CPUCores:     request.CPUCores,
		MemoryMB:     request.MemoryMB,
		Status:       "registered",
		RegisteredAt: time.Now().UTC(),
	}

	if err := api.Register(r.Context(), node); err != nil {
		if errors.Is(err, storage.ErrNodeAlreadyExists) {
			writeError(w, http.StatusConflict, "node ID already registered")
			return
		}

		log.Printf("failed to register node %q: %v", node.ID, err)
		writeError(w, http.StatusInternalServerError, "failed to register node")
		return
	}

	writeJSON(w, http.StatusCreated, node)
}

func (api *NodeAPI) listNodesHandler(w http.ResponseWriter, r *http.Request) {
	nodes, err := api.List(r.Context())
	if err != nil {
		log.Printf("failed to list nodes: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to retrieve nodes")
		return
	}

	sort.Slice(nodes, func(i, j int) bool {
		return nodes[i].ID < nodes[j].ID
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"count": len(nodes),
		"nodes": nodes,
	})
}

func (api *NodeAPI) heartbeatHandler(w http.ResponseWriter, r *http.Request) {
	nodeID := r.PathValue("id")
	now := time.Now().UTC()

	if err := api.Heartbeat(r.Context(), nodeID, now); err != nil {
		if errors.Is(err, storage.ErrNodeNotFound) {
			writeError(w, http.StatusNotFound, "node not found")
			return
		}

		log.Printf("failed to update heartbeat for node %q: %v", nodeID, err)
		writeError(w, http.StatusInternalServerError, "failed to update heartbeat")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"message":        "heartbeat received",
		"node_id":        nodeID,
		"status":         "online",
		"last_heartbeat": now,
	})
}
