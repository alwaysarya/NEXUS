package storage

import (
	"context"
	"time"
)

type Node struct {
	ID                string     `json:"id"`
	Hostname          string     `json:"hostname"`
	CPUCores          int        `json:"cpu_cores"`
	MemoryMB          int64      `json:"memory_mb"`
	AllocatedCPUCores int        `json:"allocated_cpu_cores"`
	AllocatedMemoryMB int64      `json:"allocated_memory_mb"`
	Status            string     `json:"status"`
	RegisteredAt      time.Time  `json:"registered_at"`
	LastHeartbeat     *time.Time `json:"last_heartbeat"`
}

type NodeRepository interface {
	Register(ctx context.Context, node Node) error
	GetByID(ctx context.Context, id string) (Node, error)
	List(ctx context.Context) ([]Node, error)
	Heartbeat(ctx context.Context, id string, timestamp time.Time) error
	MarkOfflineNodes(ctx context.Context, before time.Time) error
}
