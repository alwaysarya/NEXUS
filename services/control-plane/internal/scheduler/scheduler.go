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

type ResourceAllocator interface {
	Allocate(ctx context.Context, nodeID string, cpuCores int, memoryMB int64) error
}

type Scheduler struct {
	nodes     NodeLister
	resources ResourceAllocator
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

func New(nodes NodeLister, resources ResourceAllocator) *Scheduler {
	return &Scheduler{
		nodes:     nodes,
		resources: resources,
	}
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

func (s *Scheduler) Schedule(ctx context.Context, workload Workload) (Placement, error) {
	if workload.ID == "" || workload.CPUCores <= 0 || workload.MemoryMB <= 0 {
		return Placement{}, ErrInvalidWorkload
	}

	nodes, err := s.nodes.List(ctx)
	if err != nil {
		return Placement{}, fmt.Errorf("list nodes for scheduling: %w", err)
	}

	candidates := make([]storage.Node, 0)

	for _, node := range nodes {
		if node.Status != "online" {
			continue
		}

		availableCPU := node.CPUCores - node.AllocatedCPUCores
		availableMemory := node.MemoryMB - node.AllocatedMemoryMB

		if availableCPU >= workload.CPUCores &&
			availableMemory >= workload.MemoryMB {
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

	for _, node := range candidates {
		err := s.resources.Allocate(
			ctx,
			node.ID,
			workload.CPUCores,
			workload.MemoryMB,
		)

		if err == nil {
			return Placement{
				WorkloadID: workload.ID,
				NodeID:     node.ID,
				CPUCores:   workload.CPUCores,
				MemoryMB:   workload.MemoryMB,
			}, nil
		}

		if errors.Is(err, storage.ErrInsufficientNodeResources) {
			continue
		}

		return Placement{}, fmt.Errorf("allocate resources on node %s: %w", node.ID, err)
	}

	return Placement{}, ErrNoSuitableNode
}

func remainingScore(node storage.Node, workload Workload) float64 {
	remainingCPU := node.CPUCores - node.AllocatedCPUCores - workload.CPUCores
	remainingMemory := node.MemoryMB - node.AllocatedMemoryMB - workload.MemoryMB

	cpuRatio := float64(remainingCPU) / float64(node.CPUCores)
	memoryRatio := float64(remainingMemory) / float64(node.MemoryMB)

	return cpuRatio + memoryRatio
}
