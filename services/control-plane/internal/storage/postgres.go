package storage

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresConfig struct {
	DSN            string
	MaxConnections int32
	MinConnections int32
	ConnectTimeout time.Duration
}

type Postgres struct {
	Pool *pgxpool.Pool
}

func NewPostgres(
	ctx context.Context,
	config PostgresConfig,
) (*Postgres, error) {
	if config.DSN == "" {
		return nil, fmt.Errorf("postgres DSN is required")
	}

	if config.MaxConnections <= 0 {
		config.MaxConnections = 20
	}

	if config.MinConnections < 0 {
		return nil, fmt.Errorf("minimum connections cannot be negative")
	}

	if config.ConnectTimeout <= 0 {
		config.ConnectTimeout = 5 * time.Second
	}

	poolConfig, err := pgxpool.ParseConfig(config.DSN)
	if err != nil {
		return nil, fmt.Errorf("parse postgres configuration: %w", err)
	}

	poolConfig.MaxConns = config.MaxConnections
	poolConfig.MinConns = config.MinConnections
	poolConfig.MaxConnLifetime = 30 * time.Minute
	poolConfig.MaxConnIdleTime = 5 * time.Minute

	connectCtx, cancel := context.WithTimeout(ctx, config.ConnectTimeout)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(connectCtx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("create postgres connection pool: %w", err)
	}

	if err := pool.Ping(connectCtx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("ping postgres: %w", err)
	}

	return &Postgres{
		Pool: pool,
	}, nil
}

func (postgres *Postgres) Close() {
	if postgres != nil && postgres.Pool != nil {
		postgres.Pool.Close()
	}
}
