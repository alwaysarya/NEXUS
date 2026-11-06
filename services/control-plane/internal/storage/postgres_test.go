package storage

import (
	"context"
	"os"
	"testing"
	"time"
)

func TestPostgresConnection(t *testing.T) {
	dsn := os.Getenv("NEXUS_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("NEXUS_TEST_DATABASE_URL not configured")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	db, err := NewPostgres(ctx, PostgresConfig{
		DSN:            dsn,
		MaxConnections: 5,
		MinConnections: 1,
		ConnectTimeout: 5 * time.Second,
	})
	if err != nil {
		t.Fatalf("PostgreSQL connection failed: %v", err)
	}
	defer db.Close()

	if err := db.Pool.Ping(ctx); err != nil {
		t.Fatalf("PostgreSQL ping failed: %v", err)
	}
}
