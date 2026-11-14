package node_registry

import (
	"time"

	"github.com/google/uuid"
)

type WorkloadStatus string

const (
	WorkloadPending  WorkloadStatus = "pending"
	WorkloadRunning  WorkloadStatus = "running"
	WorkloadFailed   WorkloadStatus = "failed"
	WorkloadFinished WorkloadStatus = "finished"
)

type Workload struct {
	ID             uuid.UUID      `json:"id"`
	Name           string         `json:"name"`
	Image          string         `json:"image"`
	Status         WorkloadStatus `json:"status"`
	NodeID         *uuid.UUID     `json:"node_id"`
	CPURequired    int            `json:"cpu_required"`
	MemoryRequired int64          `json:"memory_required"`
	CreatedAt      time.Time      `json:"created_at"`
}
