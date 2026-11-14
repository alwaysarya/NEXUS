package storage

import (
	"context"

	"github.com/alwaysarya/nexus/services/control-plane/internal/node_registry"
	"github.com/google/uuid"
)

type WorkloadRepository interface {
	Create(ctx context.Context, w *node_registry.Workload) error
	List(ctx context.Context) ([]*node_registry.Workload, error)
	AssignNode(ctx context.Context, workloadID uuid.UUID, nodeID uuid.UUID) error
	GetByNodeID(ctx context.Context, nodeID uuid.UUID) ([]*node_registry.Workload, error)
}
