package api

import (
	"context"
	"log"
	"time"

	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
)

type NodeRepository = storage.NodeRepository

type NodeAPI struct {
	repository NodeRepository
}

func NewNodeAPI(repository NodeRepository) *NodeAPI {
	return &NodeAPI{
		repository: repository,
	}
}

func toStorageNode(node Node) storage.Node {
	return storage.Node{
		ID:            node.ID,
		Hostname:      node.Hostname,
		CPUCores:      node.CPUCores,
		MemoryMB:      node.MemoryMB,
		Status:        node.Status,
		RegisteredAt:  node.RegisteredAt,
		LastHeartbeat: node.LastHeartbeat,
	}
}

func toAPINode(node storage.Node) Node {
	availableCPUCores := node.CPUCores - node.AllocatedCPUCores
	availableMemoryMB := node.MemoryMB - node.AllocatedMemoryMB

	if availableCPUCores < 0 {
		availableCPUCores = 0
	}
	if availableMemoryMB < 0 {
		availableMemoryMB = 0
	}

	return Node{
		ID:                node.ID,
		Hostname:          node.Hostname,
		CPUCores:          node.CPUCores,
		MemoryMB:          node.MemoryMB,
		AllocatedCPUCores: node.AllocatedCPUCores,
		AllocatedMemoryMB: node.AllocatedMemoryMB,
		AvailableCPUCores: availableCPUCores,
		AvailableMemoryMB: availableMemoryMB,
		Status:            node.Status,
		RegisteredAt:      node.RegisteredAt,
		LastHeartbeat:     node.LastHeartbeat,
	}
}

func (api *NodeAPI) Register(
	ctx context.Context,
	node Node,
) error {
	return api.repository.Register(ctx, toStorageNode(node))
}

func (api *NodeAPI) GetByID(
	ctx context.Context,
	id string,
) (Node, error) {
	node, err := api.repository.GetByID(ctx, id)
	if err != nil {
		return Node{}, err
	}

	return toAPINode(node), nil
}

func (api *NodeAPI) List(
	ctx context.Context,
) ([]Node, error) {
	storageNodes, err := api.repository.List(ctx)
	if err != nil {
		return nil, err
	}

	nodes := make([]Node, 0, len(storageNodes))

	for _, node := range storageNodes {
		nodes = append(nodes, toAPINode(node))
	}

	return nodes, nil
}

func (api *NodeAPI) Heartbeat(
	ctx context.Context,
	id string,
	timestamp time.Time,
) error {
	return api.repository.Heartbeat(ctx, id, timestamp)
}

func (api *NodeAPI) MarkOfflineNodes(
	ctx context.Context,
	before time.Time,
) error {
	return api.repository.MarkOfflineNodes(ctx, before)
}

// StartMonitor periodically marks nodes offline when heartbeats expire.
func (api *NodeAPI) StartMonitor(
	ctx context.Context,
	interval time.Duration,
	timeout time.Duration,
) {
	if interval <= 0 || timeout <= 0 {
		log.Println("node monitor disabled: invalid interval or timeout")
		return
	}

	markExpiredNodes := func() {
		deadline := time.Now().UTC().Add(-timeout)
		monitorCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
		defer cancel()

		if err := api.MarkOfflineNodes(monitorCtx, deadline); err != nil {
			log.Printf("node monitor: failed to update offline nodes: %v", err)
			return
		}
	}

	markExpiredNodes()

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("node monitor stopped")
			return
		case <-ticker.C:
			markExpiredNodes()
		}
	}
}
