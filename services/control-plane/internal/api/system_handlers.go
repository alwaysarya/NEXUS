package api

import (
	"encoding/json"
	"net/http"
	"runtime"
)

type SystemHandler struct{}

func NewSystemHandler() *SystemHandler {
	return &SystemHandler{}
}

func (h *SystemHandler) GetSystemStats(w http.ResponseWriter, r *http.Request) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	// Ye real Go runtime stats hain jo backend use kar raha hai
	stats := map[string]interface{}{
		"go_version":     runtime.Version(),
		"goroutines":     runtime.NumGoroutine(),
		"cpu_cores":      runtime.NumCPU(),
		"allocated_mb":   m.Alloc / 1024 / 1024,
		"total_sys_mb":   m.Sys / 1024 / 1024,
		"gc_cycles":      m.NumGC,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
