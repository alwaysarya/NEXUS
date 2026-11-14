package scheduler

import (
	"context"
	"errors"

	"github.com/alwaysarya/nexus/services/control-plane/internal/node_registry"
	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
	"github.com/google/uuid"
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
	nodes, err := s.nodeRepo.List(ctx)
	if err != nil {
		return err
	}

	var targetNode *node_registry.Node
	for _, n := range nodes {
		if n.Status == node_registry.StatusActive {
			targetNode = n
			break
		}
	}

	if targetNode == nil {
		return errors.New("no active nodes available for scheduling")
	}

	return s.workloadRepo.AssignNode(ctx, uuid.MustParse(workloadID), targetNode.ID)
}
