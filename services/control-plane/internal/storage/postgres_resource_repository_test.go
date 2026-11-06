package storage

import (
	"context"
	"errors"
	"fmt"
	"os"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func TestPostgresResourceAllocation(t *testing.T) {
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

	repo := NewPostgresNodeRepository(db)
	nodeID := fmt.Sprintf("scheduler-test-%d", time.Now().UnixNano())

	t.Cleanup(func() {
		_, _ = db.Pool.Exec(context.Background(),
			"DELETE FROM nodes WHERE id = $1", nodeID)
	})

	node := Node{
		ID:           nodeID,
		Hostname:     "scheduler-test-node",
		CPUCores:     4,
		MemoryMB:     4096,
		Status:       "online",
		RegisteredAt: time.Now().UTC(),
	}

	if err := repo.Register(ctx, node); err != nil {
		t.Fatalf("register test node: %v", err)
	}

	var successes atomic.Int32
	var unexpected atomic.Int32
	var wg sync.WaitGroup

	for i := 0; i < 8; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()

			err := repo.Allocate(ctx, nodeID, 1, 512)
			if err == nil {
				successes.Add(1)
				return
			}
			if !errors.Is(err, ErrInsufficientNodeResources) {
				t.Errorf("unexpected allocation error: %v", err)
				unexpected.Add(1)
			}
		}()
	}

	wg.Wait()

	if unexpected.Load() != 0 {
		t.Fatalf("received %d unexpected allocation errors", unexpected.Load())
	}

	if got := successes.Load(); got != 4 {
		t.Fatalf("expected exactly 4 successful allocations, got %d", got)
	}

	got, err := repo.GetByID(ctx, nodeID)
	if err != nil {
		t.Fatal(err)
	}
	if got.AllocatedCPUCores != 4 || got.AllocatedMemoryMB != 2048 {
		t.Fatalf("unexpected allocation totals: CPU=%d RAM=%d",
			got.AllocatedCPUCores, got.AllocatedMemoryMB)
	}

	if err := repo.Release(ctx, nodeID, 2, 1024); err != nil {
		t.Fatalf("release resources: %v", err)
	}

	got, err = repo.GetByID(ctx, nodeID)
	if err != nil {
		t.Fatal(err)
	}
	if got.AllocatedCPUCores != 2 || got.AllocatedMemoryMB != 1024 {
		t.Fatalf("unexpected totals after release: CPU=%d RAM=%d",
			got.AllocatedCPUCores, got.AllocatedMemoryMB)
	}

	if err := repo.Release(ctx, nodeID, 3, 1); !errors.Is(err, ErrInvalidResourceRelease) {
		t.Fatalf("expected ErrInvalidResourceRelease, got %v", err)
	}

	if err := repo.Release(ctx, nodeID, 2, 1024); err != nil {
		t.Fatalf("release remaining resources: %v", err)
	}

	got, err = repo.GetByID(ctx, nodeID)
	if err != nil {
		t.Fatal(err)
	}
	if got.AllocatedCPUCores != 0 || got.AllocatedMemoryMB != 0 {
		t.Fatalf("expected all resources released, got CPU=%d RAM=%d",
			got.AllocatedCPUCores, got.AllocatedMemoryMB)
	}
}
