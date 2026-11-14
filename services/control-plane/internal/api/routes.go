package api

import (
	"net/http"
)

func RegisterRoutes(mux *http.ServeMux, h *Handlers) {
	mux.HandleFunc("POST /api/v1/nodes", h.RegisterNode)
}
