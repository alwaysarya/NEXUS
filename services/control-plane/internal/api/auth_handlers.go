package api

import (
	"context"
	"encoding/json"
	"net/http"
	"github.com/alwaysarya/nexus/services/control-plane/internal/auth"
	"github.com/alwaysarya/nexus/services/control-plane/internal/database"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	var dbID string
	var dbHash string
	var dbRole string
	err := database.DB.QueryRow(context.Background(), 
		"SELECT id, password_hash, role FROM users WHERE username=$1", req.Username).Scan(&dbID, &dbHash, &dbRole)
	
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Compare hashed password
	if err := bcrypt.CompareHashAndPassword([]byte(dbHash), []byte(req.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token, _ := auth.GenerateToken(req.Username, dbRole)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

// Optional: Register handler to create first user
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	_, err := database.DB.Exec(context.Background(), 
		"INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'admin')", req.Username, string(hash))
	if err != nil {
		http.Error(w, "User already exists or DB error", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte(`{"message":"User created successfully"}`))
}
