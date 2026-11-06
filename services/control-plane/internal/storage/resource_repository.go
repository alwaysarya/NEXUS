package storage

import (
	"context"
	"errors"
)

var (
	ErrInsufficientNodeResources = errors.New("insufficient node resources")
	ErrInvalidResourceRequest    = errors.New("invalid resource request")
	ErrInvalidResourceRelease    = errors.New("invalid resource release")
)

type ResourceRepository interface {
	Allocate(ctx context.Context, nodeID string, cpuCores int, memoryMB int64) error
	Release(ctx context.Context, nodeID string, cpuCores int, memoryMB int64) error
}
