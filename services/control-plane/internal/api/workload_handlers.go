package api

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/alwaysarya/nexus/services/control-plane/internal/scheduler"
	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
)

type WorkloadRequest struct {
	ID       string   `json:"id"`
	CPUCores int      `json:"cpu_cores"`
	MemoryMB int64    `json:"memory_mb"`
	Image    string   `json:"image"`
	Command  []string `json:"command"`
}

func RegisterWorkloadRoutes(mux *http.ServeMux, workloadScheduler *scheduler.Scheduler, repository storage.WorkloadRepository) {
	mux.HandleFunc("POST /api/v1/workloads", func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
		var request WorkloadRequest
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
		request.Image = strings.TrimSpace(request.Image)
		if request.Image == "" {
			request.Image = "alpine:3.21"
		}
		if request.ID == "" || request.CPUCores <= 0 || request.MemoryMB <= 0 || len(request.Image) > 512 {
			writeError(w, http.StatusBadRequest, "valid workload ID, image and positive CPU/RAM are required")
			return
		}

		candidates, err := workloadScheduler.Candidates(r.Context(), scheduler.Workload{
			ID: request.ID, CPUCores: request.CPUCores, MemoryMB: request.MemoryMB,
		})
		if err != nil {
			if errors.Is(err, scheduler.ErrInvalidWorkload) {
				writeError(w, http.StatusBadRequest, "invalid workload requirements")
				return
			}
			log.Printf("find workload placement: %v", err)
			writeError(w, http.StatusInternalServerError, "scheduling failed")
			return
		}

		for _, node := range candidates {
			workload := storage.Workload{
				ID: request.ID, NodeID: node.ID,
				CPUCores: request.CPUCores, MemoryMB: request.MemoryMB,
				Image: request.Image, Command: request.Command,
			}
			err := repository.Create(r.Context(), workload)
			if err == nil {
				created, getErr := repository.GetByID(r.Context(), request.ID)
				if getErr != nil {
					log.Printf("retrieve created workload: %v", getErr)
					writeError(w, http.StatusInternalServerError, "workload created but retrieval failed")
					return
				}
				writeJSON(w, http.StatusCreated, created)
				return
			}
			if errors.Is(err, storage.ErrInsufficientNodeResources) || errors.Is(err, storage.ErrNodeNotFound) {
				continue
			}
			if errors.Is(err, storage.ErrWorkloadAlreadyExists) {
				writeError(w, http.StatusConflict, "workload ID already exists")
				return
			}
			log.Printf("create workload %q: %v", request.ID, err)
			writeError(w, http.StatusInternalServerError, "failed to create workload")
			return
		}
		writeError(w, http.StatusConflict, "no suitable online node has sufficient resources")
	})

	mux.HandleFunc("GET /api/v1/workloads", func(w http.ResponseWriter, r *http.Request) {
		workloads, err := repository.List(r.Context())
		if err != nil {
			log.Printf("list workloads: %v", err)
			writeError(w, http.StatusInternalServerError, "failed to retrieve workloads")
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"count": len(workloads), "workloads": workloads})
	})

	mux.HandleFunc("GET /api/v1/workloads/{id}", func(w http.ResponseWriter, r *http.Request) {
		workload, err := repository.GetByID(r.Context(), r.PathValue("id"))
		if errors.Is(err, storage.ErrWorkloadNotFound) {
			writeError(w, http.StatusNotFound, "workload not found")
			return
		}
		if err != nil {
			log.Printf("get workload: %v", err)
			writeError(w, http.StatusInternalServerError, "failed to retrieve workload")
			return
		}
		writeJSON(w, http.StatusOK, workload)
	})

	mux.HandleFunc("POST /api/v1/nodes/{nodeID}/workloads/next", func(w http.ResponseWriter, r *http.Request) {
		workload, err := repository.ClaimNext(r.Context(), r.PathValue("nodeID"))
		if errors.Is(err, storage.ErrNoPendingWorkload) {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		if err != nil {
			log.Printf("claim workload: %v", err)
			writeError(w, http.StatusInternalServerError, "failed to claim workload")
			return
		}
		writeJSON(w, http.StatusOK, workload)
	})

	mux.HandleFunc("POST /api/v1/nodes/{nodeID}/workloads/{id}/running", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			ContainerID string `json:"container_id"`
		}
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4096)).Decode(&body); err != nil || strings.TrimSpace(body.ContainerID) == "" {
			writeError(w, http.StatusBadRequest, "container_id is required")
			return
		}
		err := repository.ReportRunning(r.Context(), r.PathValue("id"), r.PathValue("nodeID"), body.ContainerID)
		if errors.Is(err, storage.ErrWorkloadNotFound) {
			writeError(w, http.StatusNotFound, "workload not found or not owned by node")
			return
		}
		if err != nil {
			log.Printf("report running workload: %v", err)
			writeError(w, http.StatusInternalServerError, "failed to report running workload")
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})

	mux.HandleFunc("POST /api/v1/nodes/{nodeID}/workloads/{id}/failed", func(w http.ResponseWriter, r *http.Request) {
		var body struct {
			Error string `json:"error"`
		}
		if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4096)).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid failure report")
			return
		}
		message := strings.TrimSpace(body.Error)
		if message == "" {
			message = "container execution failed"
		}
		if len(message) > 4000 {
			message = message[:4000]
		}
		err := repository.ReportFailure(r.Context(), r.PathValue("id"), r.PathValue("nodeID"), message)
		if errors.Is(err, storage.ErrWorkloadNotFound) {
			writeError(w, http.StatusNotFound, "workload not found or not owned by node")
			return
		}
		if err != nil {
			log.Printf("report failed workload: %v", err)
			writeError(w, http.StatusInternalServerError, "failed to report workload failure")
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})

	mux.HandleFunc("POST /api/v1/workloads/{id}/complete", func(w http.ResponseWriter, r *http.Request) {
		id := r.PathValue("id")
		err := repository.Complete(r.Context(), id)
		if errors.Is(err, storage.ErrWorkloadNotFound) {
			writeError(w, http.StatusNotFound, "workload not found")
			return
		}
		if errors.Is(err, storage.ErrWorkloadAlreadyDone) {
			writeError(w, http.StatusConflict, "workload is already completed")
			return
		}
		if err != nil {
			log.Printf("complete workload: %v", err)
			writeError(w, http.StatusInternalServerError, "failed to complete workload")
			return
		}
		workload, err := repository.GetByID(r.Context(), id)
		if err != nil {
			log.Printf("retrieve completed workload: %v", err)
			writeError(w, http.StatusInternalServerError, "workload completed but retrieval failed")
			return
		}
		writeJSON(w, http.StatusOK, workload)
	})
}
