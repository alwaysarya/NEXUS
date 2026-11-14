package storage

import (
	"context"

	"github.com/alwaysarya/nexus/services/control-plane/internal/node_registry"
)

type UserRepository interface {
	Create(ctx context.Context, u *node_registry.User) error
	GetByUsername(ctx context.Context, username string) (*node_registry.User, error)
}
