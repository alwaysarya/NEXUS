package storage

import (
	"context"

	"github.com/alwaysarya/nexus/services/control-plane/internal/node_registry"
	"github.com/google/uuid"
)

type NodeRepository interface {
	Create(ctx context.Context, n *node_registry.Node) error
	GetByID(ctx context.Context, id uuid.UUID) (*node_registry.Node, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status node_registry.NodeStatus) error
	List(ctx context.Context) ([]*node_registry.Node, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
