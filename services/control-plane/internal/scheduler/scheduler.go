package scheduler

import (
	"context"
	"errors"
	"fmt"
	"sort"

	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
)

var (
	ErrInvalidWorkload = errors.New("invalid workload requirements")
	ErrNoSuitableNode  = errors.New("no suitable node available")
)

type NodeLister interface {
	List(ctx context.Context) ([]storage.Node, error)
}

type Scheduler struct {
	nodes NodeLister
}

type Workload struct {
	ID       string `json:"id"`
	CPUCores int    `json:"cpu_cores"`
	MemoryMB int64  `json:"memory_mb"`
}

type Placement struct {
	WorkloadID string `json:"workload_id"`
	NodeID     string `json:"node_id"`
	CPUCores   int    `json:"cpu_cores"`
	MemoryMB   int64  `json:"memory_mb"`
}

func New(nodes NodeLister) *Scheduler {
	return &Scheduler{nodes: nodes}
}

func (s *Scheduler) Candidates(ctx context.Context, workload Workload) ([]storage.Node, error) {
	if workload.ID == "" || workload.CPUCores <= 0 || workload.MemoryMB <= 0 {
		return nil, ErrInvalidWorkload
	}

	nodes, err := s.nodes.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("list nodes for scheduling: %w", err)
	}

	candidates := make([]storage.Node, 0)
	for _, node := range nodes {
		if node.Status != "online" {
			continue
		}

		availableCPU := node.CPUCores - node.AllocatedCPUCores
		availableMemory := node.MemoryMB - node.AllocatedMemoryMB
		if availableCPU >= workload.CPUCores && availableMemory >= workload.MemoryMB {
			candidates = append(candidates, node)
		}
	}

	sort.Slice(candidates, func(i, j int) bool {
		left := remainingScore(candidates[i], workload)
		right := remainingScore(candidates[j], workload)
		if left == right {
			return candidates[i].ID < candidates[j].ID
		}
		return left < right
	})

	return candidates, nil
}

func remainingScore(node storage.Node, workload Workload) float64 {
	remainingCPU := node.CPUCores - node.AllocatedCPUCores - workload.CPUCores
	remainingMemory := node.MemoryMB - node.AllocatedMemoryMB - workload.MemoryMB

	cpuRatio := float64(remainingCPU) / float64(node.CPUCores)
	memoryRatio := float64(remainingMemory) / float64(node.MemoryMB)

	return cpuRatio + memoryRatio
}
