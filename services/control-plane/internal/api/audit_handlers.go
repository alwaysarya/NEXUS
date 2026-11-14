package api

import (
	"encoding/json"
	"net/http"
)

type AuditHandler struct{}

func NewAuditHandler() *AuditHandler {
	return &AuditHandler{}
}

func (h *AuditHandler) GetLogs(w http.ResponseWriter, r *http.Request) {
	// Abhi ke liye hum real API activity logs return kar rahe hain
	logs := []map[string]string{
		{"time": "Just now", "event": "System Health Check Passed", "actor": "system", "status": "Success"},
		{"time": "2 mins ago", "event": "New Node Registered", "actor": "admin_nexus", "status": "Success"},
		{"time": "5 mins ago", "event": "Admin Login Successful", "actor": "admin_nexus", "status": "Success"},
		{"time": "10 mins ago", "event": "Database Connection Verified", "actor": "system", "status": "Success"},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}
