package api

import (
	"encoding/json"
	"net/http"
	"time"
)

func TrafficHistoryHandler(w http.ResponseWriter, r *http.Request) {
	data := []map[string]interface{}{}
	now := time.Now()
	for i := 23; i >= 0; i-- {
		data = append(data, map[string]interface{}{
			"time": now.Add(time.Duration(-i) * time.Hour).Format("15:04"),
			"recv": 50000000.0 + float64(i*12345),
			"sent": 20000000.0,
		})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
