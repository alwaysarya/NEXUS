package scheduler

import (
	"context"
	"errors"
	"testing"

	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
)

type fakeNodeLister struct {
	nodes []storage.Node
	err   error
}

func (f *fakeNodeLister) List(context.Context) ([]storage.Node, error) {
	return f.nodes, f.err
}

type fakeAllocator struct {
	allocated []string
	failNodes map[string]error
}

func (f *fakeAllocator) Allocate(
	_ context.Context,
	nodeID string,
	_ int,
	_ int64,
) error {
	f.allocated = append(f.allocated, nodeID)
	return f.failNodes[nodeID]
}

func TestScheduleSelectsBestFitNode(t *testing.T) {
	nodes := &fakeNodeLister{nodes: []storage.Node{
		{ID: "large-node", CPUCores: 8, MemoryMB: 8192, Status: "online"},
		{ID: "best-fit-node", CPUCores: 4, MemoryMB: 4096, Status: "online"},
		{ID: "offline-node", CPUCores: 4, MemoryMB: 4096, Status: "offline"},
	}}

	allocator := &fakeAllocator{failNodes: make(map[string]error)}
	scheduler := New(nodes, allocator)

	placement, err := scheduler.Schedule(context.Background(), Workload{
		ID:       "workload-001",
		CPUCores: 2,
		MemoryMB: 2048,
	})

	if err != nil {
		t.Fatalf("schedule failed: %v", err)
	}

	if placement.NodeID != "best-fit-node" {
		t.Fatalf("expected best-fit-node, got %s", placement.NodeID)
	}

	if len(allocator.allocated) != 1 {
		t.Fatalf("expected one allocation attempt, got %d", len(allocator.allocated))
	}
}

func TestScheduleRetriesNextCandidate(t *testing.T) {
	nodes := &fakeNodeLister{nodes: []storage.Node{
		{ID: "node-a", CPUCores: 4, MemoryMB: 4096, Status: "online"},
		{ID: "node-b", CPUCores: 8, MemoryMB: 8192, Status: "online"},
	}}

	allocator := &fakeAllocator{
		failNodes: map[string]error{
			"node-a": storage.ErrInsufficientNodeResources,
		},
	}

	scheduler := New(nodes, allocator)

	placement, err := scheduler.Schedule(context.Background(), Workload{
		ID:       "workload-002",
		CPUCores: 2,
		MemoryMB: 1024,
	})

	if err != nil {
		t.Fatalf("expected fallback scheduling, got: %v", err)
	}

	if placement.NodeID != "node-b" {
		t.Fatalf("expected node-b, got %s", placement.NodeID)
	}

	if len(allocator.allocated) != 2 {
		t.Fatalf("expected two allocation attempts, got %d", len(allocator.allocated))
	}
}

func TestScheduleRejectsInvalidWorkload(t *testing.T) {
	scheduler := New(
		&fakeNodeLister{},
		&fakeAllocator{failNodes: make(map[string]error)},
	)

	_, err := scheduler.Schedule(context.Background(), Workload{
		ID:       "",
		CPUCores: 2,
		MemoryMB: 1024,
	})

	if !errors.Is(err, ErrInvalidWorkload) {
		t.Fatalf("expected ErrInvalidWorkload, got %v", err)
	}
}

func TestScheduleRejectsInsufficientCapacity(t *testing.T) {
	scheduler := New(
		&fakeNodeLister{nodes: []storage.Node{
			{ID: "small-node", CPUCores: 2, MemoryMB: 1024, Status: "online"},
		}},
		&fakeAllocator{failNodes: make(map[string]error)},
	)

	_, err := scheduler.Schedule(context.Background(), Workload{
		ID:       "workload-003",
		CPUCores: 4,
		MemoryMB: 2048,
	})

	if !errors.Is(err, ErrNoSuitableNode) {
		t.Fatalf("expected ErrNoSuitableNode, got %v", err)
	}
}

func TestScheduleReturnsRepositoryError(t *testing.T) {
	expected := errors.New("database unavailable")

	scheduler := New(
		&fakeNodeLister{err: expected},
		&fakeAllocator{failNodes: make(map[string]error)},
	)

	_, err := scheduler.Schedule(context.Background(), Workload{
		ID:       "workload-004",
		CPUCores: 1,
		MemoryMB: 512,
	})

	if !errors.Is(err, expected) {
		t.Fatalf("expected repository error, got %v", err)
	}
}

func TestCandidatesExcludeOfflineNodes(t *testing.T) {
	nodes := &fakeNodeLister{nodes: []storage.Node{
		{ID: "online-node", CPUCores: 4, MemoryMB: 4096, Status: "online"},
		{ID: "offline-node", CPUCores: 8, MemoryMB: 8192, Status: "offline"},
	}}
	s := New(nodes, &fakeAllocator{failNodes: make(map[string]error)})

	candidates, err := s.Candidates(context.Background(), Workload{
		ID: "test-candidates", CPUCores: 1, MemoryMB: 512,
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(candidates) != 1 || candidates[0].ID != "online-node" {
		t.Fatalf("expected only online-node, got %+v", candidates)
	}
}

func TestScheduleDoesNotAllocateOnOfflineNodes(t *testing.T) {
	nodes := &fakeNodeLister{nodes: []storage.Node{
		{ID: "offline-node", CPUCores: 8, MemoryMB: 8192, Status: "offline"},
	}}
	allocator := &fakeAllocator{failNodes: make(map[string]error)}
	s := New(nodes, allocator)

	_, err := s.Schedule(context.Background(), Workload{
		ID: "test-offline", CPUCores: 1, MemoryMB: 512,
	})
	if !errors.Is(err, ErrNoSuitableNode) {
		t.Fatalf("expected ErrNoSuitableNode, got %v", err)
	}
	if len(allocator.allocated) != 0 {
		t.Fatalf("offline node received allocation attempt: %v", allocator.allocated)
	}
}
