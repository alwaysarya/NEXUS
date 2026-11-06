package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	NodeID             string
	ControlPlaneURL    string
	HeartbeatInterval  time.Duration
	RequestTimeout     time.Duration
}

func Load() (Config, error) {
	cfg := Config{
		NodeID:            os.Getenv("NEXUS_NODE_ID"),
		ControlPlaneURL:   os.Getenv("NEXUS_CONTROL_PLANE_URL"),
		HeartbeatInterval: 10 * time.Second,
		RequestTimeout:    5 * time.Second,
	}

	if cfg.NodeID == "" {
		return Config{}, fmt.Errorf("NEXUS_NODE_ID is required")
	}

	if cfg.ControlPlaneURL == "" {
		cfg.ControlPlaneURL = "http://localhost:8082"
	}

	if value := os.Getenv("NEXUS_HEARTBEAT_INTERVAL"); value != "" {
		seconds, err := strconv.Atoi(value)
		if err != nil || seconds < 1 || seconds > 300 {
			return Config{}, fmt.Errorf("NEXUS_HEARTBEAT_INTERVAL must be between 1 and 300 seconds")
		}
		cfg.HeartbeatInterval = time.Duration(seconds) * time.Second
	}

	return cfg, nil
}
