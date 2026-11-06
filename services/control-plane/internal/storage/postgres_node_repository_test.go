package storage

import (
	"context"
	"errors"
	"os"
	"testing"
	"time"
)

func TestPostgresNodeRepository(t *testing.T) {
	dsn := os.Getenv("NEXUS_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("NEXUS_TEST_DATABASE_URL not configured")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	db, err := NewPostgres(ctx, PostgresConfig{
		DSN:            dsn,
		MaxConnections: 5,
		MinConnections: 1,
		ConnectTimeout: 5 * time.Second,
	})
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	repo := NewPostgresNodeRepository(db)
	nodeID := "repository-test-" + time.Now().Format("20060102150405.000000000")

	node := Node{
		ID:           nodeID,
		Hostname:     "test-node",
		CPUCores:     4,
		MemoryMB:     8192,
		Status:       "registered",
		RegisteredAt: time.Now().UTC().Add(-time.Minute),
	}

	t.Cleanup(func() {
		_, _ = db.Pool.Exec(context.Background(),
			"DELETE FROM nodes WHERE id = $1", nodeID)
	})

	if err := repo.Register(ctx, node); err != nil {
		t.Fatalf("register failed: %v", err)
	}

	if err := repo.Register(ctx, node); err == nil {
		t.Fatal("expected duplicate registration to fail")
	}

	got, err := repo.GetByID(ctx, nodeID)
	if err != nil {
		t.Fatalf("get node failed: %v", err)
	}

	if got.Hostname != node.Hostname {
		t.Fatalf("expected hostname %s, got %s", node.Hostname, got.Hostname)
	}

	if err := repo.Heartbeat(ctx, nodeID, time.Now().UTC()); err != nil {
		t.Fatalf("heartbeat failed: %v", err)
	}

	got, err = repo.GetByID(ctx, nodeID)
	if err != nil {
		t.Fatal(err)
	}

	if got.Status != "online" || got.LastHeartbeat == nil {
		t.Fatalf("expected online node with heartbeat, got %+v", got)
	}

	if err := repo.MarkOfflineNodes(ctx, time.Now().UTC().Add(time.Second)); err != nil {
		t.Fatalf("offline transition failed: %v", err)
	}

	got, err = repo.GetByID(ctx, nodeID)
	if err != nil {
		t.Fatal(err)
	}

	if got.Status != "offline" {
		t.Fatalf("expected offline, got %s", got.Status)
	}

	_, err = repo.GetByID(ctx, nodeID+"-missing")
	if !errors.Is(err, ErrNodeNotFound) {
		t.Fatalf("expected ErrNodeNotFound, got %v", err)
	}

	nodes, err := repo.List(ctx)
	if err != nil {
		t.Fatalf("list failed: %v", err)
	}

	found := false
	for _, item := range nodes {
		if item.ID == nodeID {
			found = true
			break
		}
	}

	if !found {
		t.Fatal("registered node not found in list")
	}
}
