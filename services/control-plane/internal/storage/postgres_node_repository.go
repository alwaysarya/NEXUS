package storage

import (
	"context"
	"database/sql"

	"github.com/alwaysarya/nexus/services/control-plane/internal/node_registry"
	"github.com/google/uuid"
)

type postgresNodeRepo struct {
	db *sql.DB
}

func NewPostgresNodeRepository(db *sql.DB) NodeRepository {
	return &postgresNodeRepo{db: db}
}

func (r *postgresNodeRepo) Create(ctx context.Context, n *node_registry.Node) error {
	query := `INSERT INTO nodes (id, hostname, ip_address, status, cpu_cores, memory_mb) 
	          VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, n.ID, n.Hostname, n.IPAddress, n.Status, n.CPUCores, n.MemoryMB)
	return err
}

func (r *postgresNodeRepo) GetByID(ctx context.Context, id uuid.UUID) (*node_registry.Node, error) {
	query := `SELECT id, hostname, ip_address, status, cpu_cores, memory_mb, created_at, updated_at 
	          FROM nodes WHERE id = $1`
	row := r.db.QueryRowContext(ctx, query, id)
	
	var n node_registry.Node
	err := row.Scan(&n.ID, &n.Hostname, &n.IPAddress, &n.Status, &n.CPUCores, &n.MemoryMB, &n.CreatedAt, &n.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &n, nil
}

func (r *postgresNodeRepo) UpdateStatus(ctx context.Context, id uuid.UUID, status node_registry.NodeStatus) error {
	query := `UPDATE nodes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, status, id)
	return err
}
