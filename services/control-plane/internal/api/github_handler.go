package api

import (
	"encoding/json"
	"net/http"
	"time"
)

type Commit struct {
	ID      string `json:"id"`
	Message string `json:"message"`
	Author  string `json:"author"`
	Date    string `json:"date"`
	Status  string `json:"status"`
}

func GitHubDeploymentsHandler(w http.ResponseWriter, r *http.Request) {
	// Ye code real GitHub API se commits fetch karega (jab tu repo bata dega)
	// Abhi ke liye ek demo response bhej raha hoon jo GitHub ke format mein hai
	commits := []Commit{
		{ID: "a1b2c3d", Message: "feat: added real dashboard logic", Author: "Aryan", Date: time.Now().Format("02 Jan 15:04"), Status: "Succeeded"},
		{ID: "x9y8z7w", Message: "fix: updated UI components", Author: "Aryan", Date: time.Now().Add(-24*time.Hour).Format("02 Jan 15:04"), Status: "Succeeded"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(commits)
}
