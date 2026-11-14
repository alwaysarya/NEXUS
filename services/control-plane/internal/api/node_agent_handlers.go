package api

import (
	"encoding/json"
	"net/http"
	"github.com/google/uuid"
)

type AgentHandler struct{}

func NewAgentHandler() *AgentHandler {
	return &AgentHandler{}
}

func (h *AgentHandler) GenerateAgentToken(w http.ResponseWriter, r *http.Request) {
	// Demo ke liye ek fixed token de rahe hain, production mein ye DB me save hoga
	token := uuid.New().String()
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"agent_token": token,
		"message": "Use this token in your Node Agent config",
	})
}
