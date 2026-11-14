package api

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"database/sql"
)

type APIKeyHandler struct {
	db *sql.DB
}

func NewAPIKeyHandler(db *sql.DB) *APIKeyHandler {
	return &APIKeyHandler{db: db}
}

func (h *APIKeyHandler) GenerateKey(w http.ResponseWriter, r *http.Request) {
	// Generate secure random key
	bytes := make([]byte, 24)
	rand.Read(bytes)
	key := "nexus_sk_" + hex.EncodeToString(bytes)

	// Get user ID from context (set by AuthMiddleware)
	username, _ := r.Context().Value("username").(string)

	var userID string
	err := h.db.QueryRow("SELECT id FROM users WHERE username = $1", username).Scan(&userID)
	if err != nil {
		http.Error(w, "user not found", http.StatusInternalServerError)
		return
	}

	// Insert to DB
	query := `INSERT INTO api_keys (id, user_id, key_value, name) VALUES (gen_random_uuid(), $1, $2, 'Node Agent Key')`
	_, err = h.db.Exec(query, userID, key)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"api_key": key})
}
