package config

import (
	"os"
	"testing"
)

func TestLoadPostgresConfigRequiresPassword(t *testing.T) {
	t.Setenv("NEXUS_DB_PASSWORD", "")

	_, err := LoadPostgresConfig()
	if err == nil {
		t.Fatal("expected error when database password is missing")
	}
}

func TestLoadPostgresConfigDefaults(t *testing.T) {
	t.Setenv("NEXUS_DB_PASSWORD", "test-password")
	t.Setenv("NEXUS_DB_HOST", "")
	t.Setenv("NEXUS_DB_PORT", "")
	t.Setenv("NEXUS_DB_NAME", "")
	t.Setenv("NEXUS_DB_USER", "")
	t.Setenv("NEXUS_DB_MAX_CONNECTIONS", "")

	cfg, err := LoadPostgresConfig()
	if err != nil {
		t.Fatal(err)
	}

	if cfg.MaxConnections != 20 {
		t.Fatalf("expected 20 connections, got %d", cfg.MaxConnections)
	}

	if cfg.MinConnections != 2 {
		t.Fatalf("expected 2 minimum connections, got %d", cfg.MinConnections)
	}

	_ = os.Unsetenv("NEXUS_DB_PASSWORD")
}
