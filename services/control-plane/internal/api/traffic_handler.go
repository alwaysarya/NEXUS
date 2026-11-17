package api

import (
	"encoding/json"
	"net/http"
	"time"
	"github.com/alwaysarya/nexus/services/control-plane/internal/database"
)

func TrafficHistoryHandler(w http.ResponseWriter, r *http.Request) {
	// Fetch last 24 hours of real data from the database
	rows, err := database.DB.Query(r.Context(), `
		SELECT recv_bytes, sent_bytes, recorded_at 
		FROM traffic_history 
		WHERE recorded_at >= NOW() - INTERVAL '24 hours'
		ORDER BY recorded_at ASC
	`)
	
	var data []map[string]interface{}
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var recv, sent int64
			var recordedAt time.Time
			if err := rows.Scan(&recv, &sent, &recordedAt); err == nil {
				data = append(data, map[string]interface{}{
					"time": recordedAt.Format("15:04"),
					"recv": recv,
					"sent": sent,
				})
			}
		}
	}
	
	// If no data in DB, send a flat line (or default)
	if len(data) == 0 {
		data = append(data, map[string]interface{}{"time": time.Now().Format("15:04"), "recv": 0, "sent": 0})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
