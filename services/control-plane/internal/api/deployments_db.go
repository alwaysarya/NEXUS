package api

import (
	"encoding/json"
	"net/http"
	"time"
	"github.com/alwaysarya/nexus/services/control-plane/internal/database"
)

func DeploymentsFromDBHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := database.DB.Query(r.Context(), `
		SELECT version, message, author, environment, status, created_at 
		FROM deployments ORDER BY created_at DESC LIMIT 10
	`)
	
	var deployments []map[string]interface{}
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var version, message, author, env, status string
			var createdAt time.Time
			if err := rows.Scan(&version, &message, &author, &env, &status, &createdAt); err == nil {
				deployments = append(deployments, map[string]interface{}{
					"version": version, "message": message, "author": author,
					"environment": env, "status": status,
					"time": createdAt.Format("02 Jan 15:04"),
				})
			}
		}
	}
	if len(deployments) == 0 {
		deployments = []map[string]interface{}{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(deployments)
}
