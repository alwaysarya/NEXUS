package storage

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

type PostgresWorkloadRepository struct {
	db *Postgres
}

func NewPostgresWorkloadRepository(db *Postgres) *PostgresWorkloadRepository {
	return &PostgresWorkloadRepository{db: db}
}

func (repo *PostgresWorkloadRepository) Create(
	ctx context.Context,
	workload Workload,
) error {
	if workload.ID == "" || workload.NodeID == "" ||
		workload.CPUCores <= 0 || workload.MemoryMB <= 0 {
		return ErrInvalidResourceRequest
	}

	tx, err := repo.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin workload creation: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	result, err := tx.Exec(ctx, `
		UPDATE nodes
		SET allocated_cpu_cores = allocated_cpu_cores + $2,
		    allocated_memory_mb = allocated_memory_mb + $3
		WHERE id = $1
		  AND status = 'online'
		  AND allocated_cpu_cores + $2 <= cpu_cores
		  AND allocated_memory_mb + $3 <= memory_mb
	`, workload.NodeID, workload.CPUCores, workload.MemoryMB)
	if err != nil {
		return fmt.Errorf("reserve workload resources: %w", err)
	}

	if result.RowsAffected() == 0 {
		var exists bool
		err := tx.QueryRow(ctx,
			`SELECT EXISTS(SELECT 1 FROM nodes WHERE id = $1)`,
			workload.NodeID,
		).Scan(&exists)
		if err != nil {
			return fmt.Errorf("check workload node: %w", err)
		}
		if !exists {
			return ErrNodeNotFound
		}
		return ErrInsufficientNodeResources
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO workloads (id, node_id, cpu_cores, memory_mb)
		VALUES ($1, $2, $3, $4)
	`, workload.ID, workload.NodeID, workload.CPUCores, workload.MemoryMB)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ErrWorkloadAlreadyExists
		}
		return fmt.Errorf("insert workload: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit workload creation: %w", err)
	}

	return nil
}

func (repo *PostgresWorkloadRepository) GetByID(
	ctx context.Context,
	id string,
) (Workload, error) {
	var workload Workload
	var completedAt *time.Time

	err := repo.db.Pool.QueryRow(ctx, `
		SELECT id, node_id, cpu_cores, memory_mb, status,
		       created_at, completed_at
		FROM workloads
		WHERE id = $1
	`, id).Scan(
		&workload.ID,
		&workload.NodeID,
		&workload.CPUCores,
		&workload.MemoryMB,
		&workload.Status,
		&workload.CreatedAt,
		&completedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return Workload{}, ErrWorkloadNotFound
	}
	if err != nil {
		return Workload{}, fmt.Errorf("get workload: %w", err)
	}

	workload.CompletedAt = completedAt
	return workload, nil
}

func (repo *PostgresWorkloadRepository) List(
	ctx context.Context,
) ([]Workload, error) {
	rows, err := repo.db.Pool.Query(ctx, `
		SELECT id, node_id, cpu_cores, memory_mb, status,
		       created_at, completed_at
		FROM workloads
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, fmt.Errorf("list workloads: %w", err)
	}
	defer rows.Close()

	workloads := make([]Workload, 0)

	for rows.Next() {
		var workload Workload
		var completedAt *time.Time

		if err := rows.Scan(
			&workload.ID,
			&workload.NodeID,
			&workload.CPUCores,
			&workload.MemoryMB,
			&workload.Status,
			&workload.CreatedAt,
			&completedAt,
		); err != nil {
			return nil, fmt.Errorf("scan workload: %w", err)
		}

		workload.CompletedAt = completedAt
		workloads = append(workloads, workload)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate workloads: %w", err)
	}

	return workloads, nil
}

func (repo *PostgresWorkloadRepository) Complete(
	ctx context.Context,
	id string,
) error {
	tx, err := repo.db.Pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin workload completion: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var workload Workload

	err = tx.QueryRow(ctx, `
		SELECT id, node_id, cpu_cores, memory_mb, status
		FROM workloads
		WHERE id = $1
		FOR UPDATE
	`, id).Scan(
		&workload.ID,
		&workload.NodeID,
		&workload.CPUCores,
		&workload.MemoryMB,
		&workload.Status,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return ErrWorkloadNotFound
	}
	if err != nil {
		return fmt.Errorf("lock workload: %w", err)
	}

	if workload.Status == "completed" {
		return ErrWorkloadAlreadyDone
	}

	result, err := tx.Exec(ctx, `
		UPDATE nodes
		SET allocated_cpu_cores = allocated_cpu_cores - $2,
		    allocated_memory_mb = allocated_memory_mb - $3
		WHERE id = $1
		  AND allocated_cpu_cores >= $2
		  AND allocated_memory_mb >= $3
	`, workload.NodeID, workload.CPUCores, workload.MemoryMB)
	if err != nil {
		return fmt.Errorf("release workload resources: %w", err)
	}

	if result.RowsAffected() != 1 {
		return fmt.Errorf("resource accounting mismatch for workload %s", id)
	}

	_, err = tx.Exec(ctx, `
		UPDATE workloads
		SET status = 'completed',
		    completed_at = $2
		WHERE id = $1
	`, id, time.Now().UTC())
	if err != nil {
		return fmt.Errorf("mark workload completed: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit workload completion: %w", err)
	}

	return nil
}
