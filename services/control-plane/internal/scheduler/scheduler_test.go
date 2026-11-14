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

func TestCandidatesSelectBestFitAndExcludeOffline(t *testing.T) {
	nodes := &fakeNodeLister{nodes: []storage.Node{
		{ID: "large-node", CPUCores: 8, MemoryMB: 8192, Status: "online"},
		{ID: "best-fit-node", CPUCores: 4, MemoryMB: 4096, Status: "online"},
		{ID: "offline-node", CPUCores: 4, MemoryMB: 4096, Status: "offline"},
	}}

	s := New(nodes)
	candidates, err := s.Candidates(context.Background(), Workload{
		ID: "workload-001", CPUCores: 2, MemoryMB: 2048,
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(candidates) != 2 || candidates[0].ID != "best-fit-node" {
		t.Fatalf("unexpected candidates: %+v", candidates)
	}
}

func TestCandidatesRejectInvalidWorkload(t *testing.T) {
	s := New(&fakeNodeLister{})
	_, err := s.Candidates(context.Background(), Workload{
		ID: "", CPUCores: 1, MemoryMB: 512,
	})
	if !errors.Is(err, ErrInvalidWorkload) {
		t.Fatalf("expected ErrInvalidWorkload, got %v", err)
	}
}

func TestCandidatesRejectInsufficientCapacity(t *testing.T) {
	s := New(&fakeNodeLister{nodes: []storage.Node{
		{ID: "small-node", CPUCores: 2, MemoryMB: 1024, Status: "online"},
	}})
	candidates, err := s.Candidates(context.Background(), Workload{
		ID: "workload-002", CPUCores: 4, MemoryMB: 2048,
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(candidates) != 0 {
		t.Fatalf("expected no candidates, got %+v", candidates)
	}
}

func TestCandidatesReturnsRepositoryError(t *testing.T) {
	expected := errors.New("database unavailable")
	s := New(&fakeNodeLister{err: expected})
	_, err := s.Candidates(context.Background(), Workload{
		ID: "workload-003", CPUCores: 1, MemoryMB: 512,
	})
	if !errors.Is(err, expected) {
		t.Fatalf("expected repository error, got %v", err)
	}
}
