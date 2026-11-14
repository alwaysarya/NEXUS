package node_registry

import (
	"time"

	"github.com/google/uuid"
)

type NodeStatus string

const (
	StatusPending NodeStatus = "pending"
	StatusActive  NodeStatus = "active"
	StatusOffline NodeStatus = "offline"
)

type Node struct {
	ID        uuid.UUID  `json:"id"`
	Hostname  string     `json:"hostname"`
	IPAddress string     `json:"ip_address"`
	Status    NodeStatus `json:"status"`
	CPUCores  int        `json:"cpu_cores"`
	MemoryMB  int64      `json:"memory_mb"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}
