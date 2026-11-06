package storage

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

var (
	ErrNodeNotFound      = errors.New("node not found")
	ErrNodeAlreadyExists = errors.New("node already exists")
)

type PostgresNodeRepository struct {
	db *Postgres
}

func NewPostgresNodeRepository(db *Postgres) *PostgresNodeRepository {
	return &PostgresNodeRepository{
		db: db,
	}
}

func (repo *PostgresNodeRepository) Register(
	ctx context.Context,
	node Node,
) error {
	query := `
		INSERT INTO nodes (
			id,
			hostname,
			cpu_cores,
			memory_mb,
			status,
			registered_at,
			last_heartbeat
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err := repo.db.Pool.Exec(
		ctx,
		query,
		node.ID,
		node.Hostname,
		node.CPUCores,
		node.MemoryMB,
		node.Status,
		node.RegisteredAt,
		node.LastHeartbeat,
	)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ErrNodeAlreadyExists
		}
		return fmt.Errorf("register node: %w", err)
	}

	return nil
}

func (repo *PostgresNodeRepository) GetByID(
	ctx context.Context,
	id string,
) (Node, error) {
	query := `
		SELECT id, hostname, cpu_cores, memory_mb, allocated_cpu_cores, allocated_memory_mb,
		       status, registered_at, last_heartbeat
		FROM nodes
		WHERE id = $1
	`

	var node Node

	err := repo.db.Pool.QueryRow(ctx, query, id).Scan(
		&node.ID,
		&node.Hostname,
		&node.CPUCores,
		&node.MemoryMB,
		&node.AllocatedCPUCores,
		&node.AllocatedMemoryMB,
		&node.Status,
		&node.RegisteredAt,
		&node.LastHeartbeat,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return Node{}, ErrNodeNotFound
	}

	if err != nil {
		return Node{}, fmt.Errorf("get node: %w", err)
	}

	return node, nil
}

func (repo *PostgresNodeRepository) List(
	ctx context.Context,
) ([]Node, error) {
	query := `
		SELECT id, hostname, cpu_cores, memory_mb, allocated_cpu_cores, allocated_memory_mb,
		       status, registered_at, last_heartbeat
		FROM nodes
		ORDER BY registered_at DESC
	`

	rows, err := repo.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("list nodes: %w", err)
	}
	defer rows.Close()

	nodes := make([]Node, 0)

	for rows.Next() {
		var node Node

		err := rows.Scan(
			&node.ID,
			&node.Hostname,
			&node.CPUCores,
			&node.MemoryMB,
			&node.AllocatedCPUCores,
			&node.AllocatedMemoryMB,
			&node.Status,
			&node.RegisteredAt,
			&node.LastHeartbeat,
		)
		if err != nil {
			return nil, fmt.Errorf("scan node: %w", err)
		}

		nodes = append(nodes, node)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate nodes: %w", err)
	}

	return nodes, nil
}

func (repo *PostgresNodeRepository) Heartbeat(
	ctx context.Context,
	id string,
	timestamp time.Time,
) error {
	query := `
		UPDATE nodes
		SET last_heartbeat = $2,
		    status = 'online'
		WHERE id = $1
	`

	result, err := repo.db.Pool.Exec(ctx, query, id, timestamp)
	if err != nil {
		return fmt.Errorf("update node heartbeat: %w", err)
	}

	if result.RowsAffected() == 0 {
		return ErrNodeNotFound
	}

	return nil
}

func (repo *PostgresNodeRepository) MarkOfflineNodes(
	ctx context.Context,
	before time.Time,
) error {
	query := `
		UPDATE nodes
		SET status = 'offline'
		WHERE status != 'offline'
		  AND COALESCE(last_heartbeat, registered_at) < $1
	`

	_, err := repo.db.Pool.Exec(ctx, query, before)
	if err != nil {
		return fmt.Errorf("mark offline nodes: %w", err)
	}

	return nil
}
