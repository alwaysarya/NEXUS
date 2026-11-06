package config

import (
	"testing"
	"time"
)

func TestLoadDefaults(t *testing.T) {
	t.Setenv("NEXUS_NODE_ID", "test-node")
	t.Setenv("NEXUS_CONTROL_PLANE_URL", "")
	t.Setenv("NEXUS_HEARTBEAT_INTERVAL", "")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load() returned error: %v", err)
	}

	if cfg.NodeID != "test-node" {
		t.Errorf("expected NodeID test-node, got %s", cfg.NodeID)
	}

	if cfg.ControlPlaneURL != "http://localhost:8082" {
		t.Errorf("unexpected ControlPlaneURL: %s", cfg.ControlPlaneURL)
	}

	if cfg.HeartbeatInterval != 10*time.Second {
		t.Errorf("unexpected HeartbeatInterval: %v", cfg.HeartbeatInterval)
	}

	if cfg.RequestTimeout != 5*time.Second {
		t.Errorf("unexpected RequestTimeout: %v", cfg.RequestTimeout)
	}
}

func TestLoadRequiresNodeID(t *testing.T) {
	t.Setenv("NEXUS_NODE_ID", "")

	_, err := Load()
	if err == nil {
		t.Fatal("expected an error when Node ID is missing")
	}
}

func TestLoadRejectsInvalidHeartbeatInterval(t *testing.T) {
	t.Setenv("NEXUS_NODE_ID", "test-node")
	t.Setenv("NEXUS_HEARTBEAT_INTERVAL", "500")

	_, err := Load()
	if err == nil {
		t.Fatal("expected an error for an invalid heartbeat interval")
	}
}
