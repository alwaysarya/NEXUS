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
	ErrNoPendingWorkload     = errors.New("no pending workload")
)

type Workload struct {
	ID           string     `json:"id"`
	Image        string     `json:"image"`
	Command      []string   `json:"command"`
	ContainerID  string     `json:"container_id,omitempty"`
	ErrorMessage string     `json:"error_message,omitempty"`
	NodeID       string     `json:"node_id"`
	CPUCores     int        `json:"cpu_cores"`
	MemoryMB     int64      `json:"memory_mb"`
	Status       string     `json:"status"`
	CreatedAt    time.Time  `json:"created_at"`
	CompletedAt  *time.Time `json:"completed_at,omitempty"`
}

type WorkloadRepository interface {
	Create(ctx context.Context, workload Workload) error
	GetByID(ctx context.Context, id string) (Workload, error)
	List(ctx context.Context) ([]Workload, error)
	Complete(ctx context.Context, id string) error
	ClaimNext(ctx context.Context, nodeID string) (Workload, error)
	ReportRunning(ctx context.Context, id, nodeID, containerID string) error
	ReportFailure(ctx context.Context, id, nodeID, message string) error
}
