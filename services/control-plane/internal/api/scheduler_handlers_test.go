package api

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/alwaysarya/nexus/services/control-plane/internal/scheduler"
	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
)

type schedulerTestNodes struct {
	nodes []storage.Node
}

func (f schedulerTestNodes) List(context.Context) ([]storage.Node, error) {
	return f.nodes, nil
}

type schedulerTestAllocator struct{}

func (schedulerTestAllocator) Allocate(context.Context, string, int, int64) error {
	return nil
}

func TestSchedulerAPI(t *testing.T) {
	nodes := schedulerTestNodes{
		nodes: []storage.Node{
			{
				ID:       "worker-001",
				CPUCores: 8,
				MemoryMB: 16384,
				Status:   "online",
			},
		},
	}

	workloadScheduler := scheduler.New(nodes, schedulerTestAllocator{})
	mux := http.NewServeMux()
	RegisterSchedulerRoutes(mux, workloadScheduler)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/scheduler/schedule",
		strings.NewReader(`{"id":"workload-001","cpu_cores":2,"memory_mb":2048}`),
	)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rec.Code, rec.Body.String())
	}

	if !strings.Contains(rec.Body.String(), `"node_id":"worker-001"`) {
		t.Fatalf("expected worker-001 placement, got %s", rec.Body.String())
	}
}

func TestSchedulerAPIRejectsInvalidWorkload(t *testing.T) {
	mux := http.NewServeMux()
	RegisterSchedulerRoutes(
		mux,
		scheduler.New(schedulerTestNodes{}, schedulerTestAllocator{}),
	)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/scheduler/schedule",
		strings.NewReader(`{"id":"","cpu_cores":0,"memory_mb":0}`),
	)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

type unavailableSchedulerAllocator struct{}

func (unavailableSchedulerAllocator) Allocate(context.Context, string, int, int64) error {
	return storage.ErrInsufficientNodeResources
}

func TestSchedulerAPIRejectsInsufficientResources(t *testing.T) {
	nodes := schedulerTestNodes{
		nodes: []storage.Node{
			{ID: "worker-002", CPUCores: 4, MemoryMB: 4096, Status: "online"},
		},
	}

	mux := http.NewServeMux()
	RegisterSchedulerRoutes(
		mux,
		scheduler.New(nodes, unavailableSchedulerAllocator{}),
	)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/scheduler/schedule",
		strings.NewReader(`{"id":"workload-002","cpu_cores":2,"memory_mb":1024}`),
	)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d: %s", rec.Code, rec.Body.String())
	}
}

type failedSchedulerNodes struct{}

func (failedSchedulerNodes) List(context.Context) ([]storage.Node, error) {
	return nil, errors.New("database unavailable")
}

func TestSchedulerAPIHandlesRepositoryFailure(t *testing.T) {
	mux := http.NewServeMux()
	RegisterSchedulerRoutes(
		mux,
		scheduler.New(failedSchedulerNodes{}, schedulerTestAllocator{}),
	)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/scheduler/schedule",
		strings.NewReader(`{"id":"workload-003","cpu_cores":1,"memory_mb":512}`),
	)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", rec.Code)
	}
}
