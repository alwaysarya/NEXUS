package config

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
)

func LoadPostgresConfig() (storage.PostgresConfig, error) {
	host := os.Getenv("NEXUS_DB_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("NEXUS_DB_PORT")
	if port == "" {
		port = "5434"
	}

	name := os.Getenv("NEXUS_DB_NAME")
	if name == "" {
		name = "nexus"
	}

	user := os.Getenv("NEXUS_DB_USER")
	if user == "" {
		user = "nexus_app"
	}

	password := os.Getenv("NEXUS_DB_PASSWORD")
	if password == "" {
		return storage.PostgresConfig{}, fmt.Errorf(
			"NEXUS_DB_PASSWORD is required",
		)
	}

	maxConnections := int32(20)
	if value := os.Getenv("NEXUS_DB_MAX_CONNECTIONS"); value != "" {
		parsed, err := strconv.ParseInt(value, 10, 32)
		if err != nil || parsed <= 0 {
			return storage.PostgresConfig{}, fmt.Errorf(
				"invalid NEXUS_DB_MAX_CONNECTIONS",
			)
		}
		maxConnections = int32(parsed)
	}

	dsn := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s",
		user,
		password,
		host,
		port,
		name,
	)

	return storage.PostgresConfig{
		DSN:            dsn,
		MaxConnections: maxConnections,
		MinConnections: 2,
		ConnectTimeout: 5 * time.Second,
	}, nil
}
