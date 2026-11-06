package api

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/alwaysarya/nexus/services/control-plane/internal/scheduler"
)

func RegisterSchedulerRoutes(mux *http.ServeMux, workloadScheduler *scheduler.Scheduler) {
	mux.HandleFunc("POST /api/v1/scheduler/schedule", func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

		var workload scheduler.Workload
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()

		if err := decoder.Decode(&workload); err != nil {
			writeError(w, http.StatusBadRequest, "invalid JSON request")
			return
		}

		var extra any
		if err := decoder.Decode(&extra); !errors.Is(err, io.EOF) {
			writeError(w, http.StatusBadRequest, "request must contain one JSON object")
			return
		}

		workload.ID = strings.TrimSpace(workload.ID)

		if workload.ID == "" || workload.CPUCores <= 0 || workload.MemoryMB <= 0 {
			writeError(w, http.StatusBadRequest, "workload ID, positive CPU cores and positive memory are required")
			return
		}

		placement, err := workloadScheduler.Schedule(r.Context(), workload)
		if err != nil {
			if errors.Is(err, scheduler.ErrInvalidWorkload) {
				writeError(w, http.StatusBadRequest, "invalid workload requirements")
				return
			}
			if errors.Is(err, scheduler.ErrNoSuitableNode) {
				writeError(w, http.StatusConflict, "no suitable node has sufficient resources")
				return
			}

			writeError(w, http.StatusInternalServerError, "scheduling failed")
			return
		}

		writeJSON(w, http.StatusCreated, placement)
	})
}
