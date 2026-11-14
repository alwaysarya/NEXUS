package scheduler

import (
	"context"
	"testing"

	"github.com/alwaysarya/nexus/services/control-plane/internal/node_registry"
	"github.com/google/uuid"
)

// Mock Node Repository
type mockNodeRepo struct{}
func (m *mockNodeRepo) Create(ctx context.Context, n *node_registry.Node) error { return nil }
func (m *mockNodeRepo) GetByID(ctx context.Context, id uuid.UUID) (*node_registry.Node, error) { return nil, nil }
func (m *mockNodeRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status node_registry.NodeStatus) error { return nil }
func (m *mockNodeRepo) Delete(ctx context.Context, id uuid.UUID) error { return nil }
func (m *mockNodeRepo) List(ctx context.Context) ([]*node_registry.Node, error) {
	return []*node_registry.Node{
		{ID: uuid.New(), Hostname: "node-1", Status: node_registry.StatusActive, CPUCores: 10, MemoryMB: 16384},
	}, nil
}

// Mock Workload Repository
type mockWorkloadRepo struct{}
func (m *mockWorkloadRepo) Create(ctx context.Context, w *node_registry.Workload) error { return nil }
func (m *mockWorkloadRepo) List(ctx context.Context) ([]*node_registry.Workload, error) {
	return []*node_registry.Workload{
		{ID: uuid.MustParse("00000000-0000-0000-0000-000000000001"), Name: "test-app", CPURequired: 2, MemoryRequired: 2048},
	}, nil
}
func (m *mockWorkloadRepo) AssignNode(ctx context.Context, workloadID uuid.UUID, nodeID uuid.UUID) error { return nil }
func (m *mockWorkloadRepo) GetByNodeID(ctx context.Context, nodeID uuid.UUID) ([]*node_registry.Workload, error) { return nil, nil }

// TEST CASE
func TestScheduleSuccess(t *testing.T) {
	nodeRepo := &mockNodeRepo{}
	workloadRepo := &mockWorkloadRepo{}
	sched := NewScheduler(nodeRepo, workloadRepo)

	err := sched.Schedule(context.Background(), "00000000-0000-0000-0000-000000000001")
	
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
}
