package client

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/alwaysarya/nexus/services/node-agent/internal/config"
	"github.com/alwaysarya/nexus/services/node-agent/internal/system"
)

func TestRegister(t *testing.T) {
	for _, status := range []int{
		http.StatusCreated,
		http.StatusConflict,
	} {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodPost || r.URL.Path != "/api/v1/nodes" {
				t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
			}
			w.WriteHeader(status)
		}))

		cfg := config.Config{
			ControlPlaneURL: server.URL,
			RequestTimeout:  5 * time.Second,
		}
		c := New(cfg)

		err := c.Register(context.Background(), "test-node", system.Info{
			Hostname: "test-host",
			CPUCores: 4,
			MemoryMB: 8192,
		})

		server.Close()

		if err != nil {
			t.Errorf("Register() failed for HTTP %d: %v", status, err)
		}
	}
}

func TestHeartbeat(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost || r.URL.Path != "/api/v1/nodes/test-node/heartbeat" {
			t.Errorf("unexpected request: %s %s", r.Method, r.URL.Path)
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	c := New(config.Config{
		ControlPlaneURL: server.URL,
		RequestTimeout:  5 * time.Second,
	})

	if err := c.Heartbeat(context.Background(), "test-node"); err != nil {
		t.Fatalf("Heartbeat() failed: %v", err)
	}
}

func TestHeartbeatRejectsUnexpectedStatus(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
	}))
	defer server.Close()

	c := New(config.Config{
		ControlPlaneURL: server.URL,
		RequestTimeout:  5 * time.Second,
	})

	if err := c.Heartbeat(context.Background(), "missing-node"); err == nil {
		t.Fatal("expected an error for HTTP 404")
	}
}
