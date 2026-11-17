package api

import (
	"encoding/json"
	"net/http"
)

func GitHubDeploymentsHandler(w http.ResponseWriter, r *http.Request) {
	// In a real scenario, you would call GitHub API here. 
	// For now, returning dynamic mock data to show it's connected.
	commits := []map[string]interface{}{
		{"id": "de651ff", "message": "fix: updated deployment date formats", "author": "Aryan", "date": "18 Nov 05:02", "status": "Succeeded", "environment": "Production"},
		{"id": "a1b2c3d", "message": "feat: added real dashboard logic", "author": "Aryan", "date": "18 Nov 04:37", "status": "Succeeded", "environment": "Production"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(commits)
}
