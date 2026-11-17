package api

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/alwaysarya/nexus/services/control-plane/internal/database"
)

type agentTokenRequest struct {
	NodeID string `json:"node_id"`
}

func CreateAgentTokenHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req agentTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.NodeID) == "" {
		http.Error(w, "Valid node_id is required", http.StatusBadRequest)
		return
	}
	req.NodeID = strings.TrimSpace(req.NodeID)

	randomBytes := make([]byte, 32)
	if _, err := rand.Read(randomBytes); err != nil {
		http.Error(w, "Token generation failed", http.StatusInternalServerError)
		return
	}

	token := "nexus_agent_" + hex.EncodeToString(randomBytes)
	hash := sha256.Sum256([]byte(token))
	tokenHash := hex.EncodeToString(hash[:])

	_, err := database.DB.Exec(r.Context(), `
		INSERT INTO agent_tokens (node_id, token_hash)
		VALUES ($1, $2)
		ON CONFLICT (node_id)
		DO UPDATE SET
			token_hash = EXCLUDED.token_hash,
			created_at = NOW(),
			revoked_at = NULL
	`, req.NodeID, tokenHash)

	if err != nil {
		http.Error(w, "Could not save Agent token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"node_id":     req.NodeID,
		"agent_token": token,
		"message":     "Store this token securely. It will not be shown again.",
	})
}

func RevokeAgentTokenHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req agentTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.NodeID) == "" {
		http.Error(w, "Valid node_id is required", http.StatusBadRequest)
		return
	}

	tag, err := database.DB.Exec(r.Context(), `
		UPDATE agent_tokens
		SET revoked_at = NOW()
		WHERE node_id = $1 AND revoked_at IS NULL
	`, strings.TrimSpace(req.NodeID))

	if err != nil {
		http.Error(w, "Could not revoke Agent token", http.StatusInternalServerError)
		return
	}
	if tag.RowsAffected() == 0 {
		http.Error(w, "Active Agent token not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
