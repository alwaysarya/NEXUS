package storage

import (
	"context"
	"errors"
	"fmt"
	"os"
	"testing"
	"time"
)

func TestPostgresWorkloadLifecycle(t *testing.T) {
	dsn := os.Getenv("NEXUS_TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("NEXUS_TEST_DATABASE_URL not configured")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	db, err := NewPostgres(ctx, PostgresConfig{
		DSN:            dsn,
		MaxConnections: 10,
		MinConnections: 1,
		ConnectTimeout: 5 * time.Second,
	})
	if err != nil {
		t.Fatal(err)
	}
	defer db.Close()

	nodeRepo := NewPostgresNodeRepository(db)
	workloadRepo := NewPostgresWorkloadRepository(db)

	nodeID := fmt.Sprintf("workload-test-node-%d", time.Now().UnixNano())
	workloadID := fmt.Sprintf("workload-test-%d", time.Now().UnixNano())

	t.Cleanup(func() {
		_, _ = db.Pool.Exec(context.Background(),
			"DELETE FROM workloads WHERE node_id = $1", nodeID)
		_, _ = db.Pool.Exec(context.Background(),
			"DELETE FROM nodes WHERE id = $1", nodeID)
	})

	node := Node{
		ID:           nodeID,
		Hostname:     "workload-test-node",
		CPUCores:     4,
		MemoryMB:     4096,
		Status:       "online",
		RegisteredAt: time.Now().UTC(),
	}

	if err := nodeRepo.Register(ctx, node); err != nil {
		t.Fatalf("register test node: %v", err)
	}

	workload := Workload{
		ID:       workloadID,
		NodeID:   nodeID,
		CPUCores: 2,
		MemoryMB: 1024,
	}

	// Create workload and reserve resources.
	if err := workloadRepo.Create(ctx, workload); err != nil {
		t.Fatalf("create workload: %v", err)
	}

	got, err := workloadRepo.GetByID(ctx, workloadID)
	if err != nil {
		t.Fatalf("get workload: %v", err)
	}
	if got.Status != "running" || got.NodeID != nodeID {
		t.Fatalf("unexpected workload after creation: %+v", got)
	}

	nodeState, err := nodeRepo.GetByID(ctx, nodeID)
	if err != nil {
		t.Fatal(err)
	}
	if nodeState.AllocatedCPUCores != 2 || nodeState.AllocatedMemoryMB != 1024 {
		t.Fatalf("unexpected allocation after create: CPU=%d RAM=%d",
			nodeState.AllocatedCPUCores, nodeState.AllocatedMemoryMB)
	}

	// Duplicate creation must fail and roll back its resource update.
	if err := workloadRepo.Create(ctx, workload); !errors.Is(err, ErrWorkloadAlreadyExists) {
		t.Fatalf("expected ErrWorkloadAlreadyExists, got %v", err)
	}

	nodeState, err = nodeRepo.GetByID(ctx, nodeID)
	if err != nil {
		t.Fatal(err)
	}
	if nodeState.AllocatedCPUCores != 2 || nodeState.AllocatedMemoryMB != 1024 {
		t.Fatalf("duplicate creation changed allocation: CPU=%d RAM=%d",
			nodeState.AllocatedCPUCores, nodeState.AllocatedMemoryMB)
	}

	// List must include the persisted workload.
	workloads, err := workloadRepo.List(ctx)
	if err != nil {
		t.Fatalf("list workloads: %v", err)
	}

	found := false
	for _, item := range workloads {
		if item.ID == workloadID {
			found = true
			break
		}
	}
	if !found {
		t.Fatal("created workload missing from list")
	}

	// Complete workload and release resources.
	if err := workloadRepo.Complete(ctx, workloadID); err != nil {
		t.Fatalf("complete workload: %v", err)
	}

	got, err = workloadRepo.GetByID(ctx, workloadID)
	if err != nil {
		t.Fatal(err)
	}
	if got.Status != "completed" || got.CompletedAt == nil {
		t.Fatalf("workload was not marked completed: %+v", got)
	}

	nodeState, err = nodeRepo.GetByID(ctx, nodeID)
	if err != nil {
		t.Fatal(err)
	}
	if nodeState.AllocatedCPUCores != 0 || nodeState.AllocatedMemoryMB != 0 {
		t.Fatalf("resources not released: CPU=%d RAM=%d",
			nodeState.AllocatedCPUCores, nodeState.AllocatedMemoryMB)
	}

	// Repeated completion must not release resources twice.
	if err := workloadRepo.Complete(ctx, workloadID); !errors.Is(err, ErrWorkloadAlreadyDone) {
		t.Fatalf("expected ErrWorkloadAlreadyDone, got %v", err)
	}

	if _, err := workloadRepo.GetByID(ctx, "missing-workload"); !errors.Is(err, ErrWorkloadNotFound) {
		t.Fatalf("expected ErrWorkloadNotFound, got %v", err)
	}
}
