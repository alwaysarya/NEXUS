package main

import (
	"fmt"
	"log"
	"net/http"
	"github.com/alwaysarya/nexus/services/control-plane/internal/api"
)

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	mux := http.NewServeMux()
	
	mux.HandleFunc("/api/health", api.CustomHealthHandler)
	mux.HandleFunc("/api/nodes", api.CustomNodesHandler)

	handler := CORS(mux)

	fmt.Println("🚀 Control Plane running on :8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
