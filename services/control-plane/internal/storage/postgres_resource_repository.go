package storage

import (
	"context"
	"fmt"
)

func (repo *PostgresNodeRepository) Allocate(
	ctx context.Context,
	nodeID string,
	cpuCores int,
	memoryMB int64,
) error {
	if cpuCores < 0 || memoryMB < 0 || (cpuCores == 0 && memoryMB == 0) {
		return ErrInvalidResourceRequest
	}

	query := `
		UPDATE nodes
		SET allocated_cpu_cores = allocated_cpu_cores + $2,
		    allocated_memory_mb = allocated_memory_mb + $3
		WHERE id = $1
		  AND status = 'online'
		  AND allocated_cpu_cores + $2 <= cpu_cores
		  AND allocated_memory_mb + $3 <= memory_mb
	`

	result, err := repo.db.Pool.Exec(ctx, query, nodeID, cpuCores, memoryMB)
	if err != nil {
		return fmt.Errorf("allocate node resources: %w", err)
	}

	if result.RowsAffected() == 0 {
		var exists bool
		err := repo.db.Pool.QueryRow(
			ctx,
			`SELECT EXISTS(SELECT 1 FROM nodes WHERE id = $1)`,
			nodeID,
		).Scan(&exists)
		if err != nil {
			return fmt.Errorf("check node existence: %w", err)
		}
		if !exists {
			return ErrNodeNotFound
		}
		return ErrInsufficientNodeResources
	}

	return nil
}

func (repo *PostgresNodeRepository) Release(
	ctx context.Context,
	nodeID string,
	cpuCores int,
	memoryMB int64,
) error {
	if cpuCores < 0 || memoryMB < 0 || (cpuCores == 0 && memoryMB == 0) {
		return ErrInvalidResourceRelease
	}

	query := `
		UPDATE nodes
		SET allocated_cpu_cores = allocated_cpu_cores - $2,
		    allocated_memory_mb = allocated_memory_mb - $3
		WHERE id = $1
		  AND allocated_cpu_cores >= $2
		  AND allocated_memory_mb >= $3
	`

	result, err := repo.db.Pool.Exec(ctx, query, nodeID, cpuCores, memoryMB)
	if err != nil {
		return fmt.Errorf("release node resources: %w", err)
	}

	if result.RowsAffected() == 0 {
		var exists bool
		err := repo.db.Pool.QueryRow(
			ctx,
			`SELECT EXISTS(SELECT 1 FROM nodes WHERE id = $1)`,
			nodeID,
		).Scan(&exists)
		if err != nil {
			return fmt.Errorf("check node existence: %w", err)
		}
		if !exists {
			return ErrNodeNotFound
		}
		return ErrInvalidResourceRelease
	}

	return nil
}
