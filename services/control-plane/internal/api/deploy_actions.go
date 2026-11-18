package api

import (
	"encoding/json"
	"net/http"
	"os/exec"
)

func DeployActionHandler(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Action string `json:"action"`
		Name   string `json:"name"`
	}
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	var cmd *exec.Cmd
	if req.Action == "restart" {
		cmd = exec.Command("kubectl", "rollout", "restart", "deployment", req.Name)
	} else if req.Action == "rollback" {
		cmd = exec.Command("kubectl", "rollout", "undo", "deployment", req.Name)
	} else {
		http.Error(w, "Invalid action", http.StatusBadRequest)
		return
	}

	out, err := cmd.CombinedOutput()
	if err != nil {
		http.Error(w, string(out), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}
