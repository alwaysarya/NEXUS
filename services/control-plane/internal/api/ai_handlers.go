package api

import (
	"encoding/json"
	"net/http"
	"github.com/alwaysarya/nexus/services/control-plane/internal/intelligence"
)

func AIPredictHandler(w http.ResponseWriter, r *http.Request) {
	// Hum ek dummy node ka data AI ko bhej rahe hain
	pred, err := intelligence.GetPrediction(92.5, 88.0)
	if err != nil {
		http.Error(w, "AI Engine unreachable", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pred)
}
