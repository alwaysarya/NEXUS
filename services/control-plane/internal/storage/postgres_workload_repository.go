package storage

import (
	"context"
	"database/sql"

	"github.com/alwaysarya/nexus/services/control-plane/internal/node_registry"
	"github.com/google/uuid"
)

type postgresWorkloadRepo struct {
	db *sql.DB
}

func NewPostgresWorkloadRepository(db *sql.DB) WorkloadRepository {
	return &postgresWorkloadRepo{db: db}
}

func (r *postgresWorkloadRepo) Create(ctx context.Context, w *node_registry.Workload) error {
	query := `INSERT INTO workloads (id, name, image, status, cpu_required, memory_required) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.db.ExecContext(ctx, query, w.ID, w.Name, w.Image, w.Status, w.CPURequired, w.MemoryRequired)
	return err
}

func (r *postgresWorkloadRepo) List(ctx context.Context) ([]*node_registry.Workload, error) {
	query := `SELECT id, name, image, status, node_id, cpu_required, memory_required, created_at FROM workloads`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil { return nil, err }
	defer rows.Close()
	var workloads []*node_registry.Workload
	for rows.Next() {
		var w node_registry.Workload
		if err := rows.Scan(&w.ID, &w.Name, &w.Image, &w.Status, &w.NodeID, &w.CPURequired, &w.MemoryRequired, &w.CreatedAt); err != nil { return nil, err }
		workloads = append(workloads, &w)
	}
	return workloads, nil
}

func (r *postgresWorkloadRepo) AssignNode(ctx context.Context, workloadID uuid.UUID, nodeID uuid.UUID) error {
	query := `UPDATE workloads SET node_id = $1, status = 'running' WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, nodeID, workloadID)
	return err
}

func (r *postgresWorkloadRepo) GetByNodeID(ctx context.Context, nodeID uuid.UUID) ([]*node_registry.Workload, error) {
	query := `SELECT id, name, image, status, node_id, cpu_required, memory_required, created_at FROM workloads WHERE node_id = $1`
	rows, err := r.db.QueryContext(ctx, query, nodeID)
	if err != nil { return nil, err }
	defer rows.Close()
	var workloads []*node_registry.Workload
	for rows.Next() {
		var w node_registry.Workload
		if err := rows.Scan(&w.ID, &w.Name, &w.Image, &w.Status, &w.NodeID, &w.CPURequired, &w.MemoryRequired, &w.CreatedAt); err != nil { return nil, err }
		workloads = append(workloads, &w)
	}
	return workloads, nil
}
