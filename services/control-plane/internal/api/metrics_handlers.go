package api

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type MetricsHandler struct{}

func NewMetricsHandler() *MetricsHandler {
	return &MetricsHandler{}
}

func (h *MetricsHandler) ServeMetrics(w http.ResponseWriter, r *http.Request) {
	// Ye handler Prometheus ko saare system metrics (CPU, Memory, Go Routines, HTTP requests) dega
	promhttp.Handler().ServeHTTP(w, r)
}
