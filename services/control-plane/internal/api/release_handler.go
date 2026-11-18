package api

import (
	"encoding/json"
	"net/http"
	"os/exec"
	"fmt"
)

func CreateReleaseHandler(w http.ResponseWriter, r *http.Request) {
	// Generate a random tag/version for new release
	version := fmt.Sprintf("v1.0.%d", os.Getpid()) // Just using PID as fake version for now

	// Create a new deployment in K8s
	cmd := exec.Command("kubectl", "create", "deployment", "nexus-release-"+version, "--image=nginx", "--replicas=1")
	_, err := cmd.Output()

	if err != nil {
		http.Error(w, "Failed to create release in K8s", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "version": version})
}
