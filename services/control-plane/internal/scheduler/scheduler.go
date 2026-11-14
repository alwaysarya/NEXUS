package scheduler

import (
	"context"
	"errors"

	"github.com/alwaysarya/nexus/services/control-plane/internal/node_registry"
	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
)

type Scheduler struct {
	nodeRepo     storage.NodeRepository
	workloadRepo storage.WorkloadRepository
}

func NewScheduler(nodeRepo storage.NodeRepository, workloadRepo storage.WorkloadRepository) *Scheduler {
	return &Scheduler{
		nodeRepo:     nodeRepo,
		workloadRepo: workloadRepo,
	}
}

func (s *Scheduler) Schedule(ctx context.Context, workloadID string) error {
	// 1. Get Workload details (we need to know CPU/RAM required)
	workloads, err := s.workloadRepo.List(ctx)
	if err != nil {
		return err
	}
	
	var targetWorkload *node_registry.Workload
	for _, w := range workloads {
		if w.ID.String() == workloadID {
			targetWorkload = w
			break
		}
	}
	if targetWorkload == nil {
		return errors.New("workload not found")
	}

	// 2. Get all active nodes
	nodes, err := s.nodeRepo.List(ctx)
	if err != nil {
		return err
	}

	// 3. Find best node (Basic Filter: Node must have enough CPU and Memory)
	var selectedNode *node_registry.Node
	for _, n := range nodes {
		if n.Status == node_registry.StatusActive {
			// Check resources (assuming node is empty for now, real system would subtract used resources)
			if n.CPUCores >= targetWorkload.CPURequired && n.MemoryMB >= targetWorkload.MemoryRequired {
				selectedNode = n
				break
			}
		}
	}

	if selectedNode == nil {
		return errors.New("no active nodes available with sufficient resources")
	}

	// 4. Assign workload to node
	return s.workloadRepo.AssignNode(ctx, targetWorkload.ID, selectedNode.ID)
}
