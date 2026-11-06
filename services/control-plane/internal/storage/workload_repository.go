package storage

import (
	"context"
	"errors"
	"time"
)

var (
	ErrWorkloadNotFound      = errors.New("workload not found")
	ErrWorkloadAlreadyExists = errors.New("workload already exists")
	ErrWorkloadAlreadyDone   = errors.New("workload already completed")
)

type Workload struct {
	ID          string     `json:"id"`
	NodeID      string     `json:"node_id"`
	CPUCores    int        `json:"cpu_cores"`
	MemoryMB    int64      `json:"memory_mb"`
	Status      string     `json:"status"`
	CreatedAt   time.Time  `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

type WorkloadRepository interface {
	Create(ctx context.Context, workload Workload) error
	GetByID(ctx context.Context, id string) (Workload, error)
	List(ctx context.Context) ([]Workload, error)
	Complete(ctx context.Context, id string) error
}
