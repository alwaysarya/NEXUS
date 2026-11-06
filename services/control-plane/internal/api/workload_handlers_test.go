package api

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/alwaysarya/nexus/services/control-plane/internal/scheduler"
	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
)

type workloadAPINodes struct {
	nodes []storage.Node
}

func (f workloadAPINodes) List(context.Context) ([]storage.Node, error) {
	return f.nodes, nil
}

type workloadAPIAllocator struct{}

func (workloadAPIAllocator) Allocate(context.Context, string, int, int64) error {
	return nil
}

type workloadAPIRepository struct {
	items map[string]storage.Workload
}

func newWorkloadAPIRepository() *workloadAPIRepository {
	return &workloadAPIRepository{items: make(map[string]storage.Workload)}
}

func (f *workloadAPIRepository) Create(_ context.Context, w storage.Workload) error {
	if _, exists := f.items[w.ID]; exists {
		return storage.ErrWorkloadAlreadyExists
	}
	w.Status = "running"
	w.CreatedAt = time.Now().UTC()
	f.items[w.ID] = w
	return nil
}

func (f *workloadAPIRepository) GetByID(_ context.Context, id string) (storage.Workload, error) {
	w, ok := f.items[id]
	if !ok {
		return storage.Workload{}, storage.ErrWorkloadNotFound
	}
	return w, nil
}

func (f *workloadAPIRepository) List(context.Context) ([]storage.Workload, error) {
	result := make([]storage.Workload, 0, len(f.items))
	for _, w := range f.items {
		result = append(result, w)
	}
	return result, nil
}

func (f *workloadAPIRepository) Complete(_ context.Context, id string) error {
	w, ok := f.items[id]
	if !ok {
		return storage.ErrWorkloadNotFound
	}
	if w.Status == "completed" {
		return storage.ErrWorkloadAlreadyDone
	}
	now := time.Now().UTC()
	w.Status = "completed"
	w.CompletedAt = &now
	f.items[id] = w
	return nil
}

func newWorkloadAPITestServer() (*http.ServeMux, *workloadAPIRepository) {
	repo := newWorkloadAPIRepository()
	nodes := workloadAPINodes{nodes: []storage.Node{
		{
			ID: "worker-api-test", CPUCores: 8, MemoryMB: 16384,
			Status: "online",
		},
	}}
	s := scheduler.New(nodes, workloadAPIAllocator{})
	mux := http.NewServeMux()
	RegisterWorkloadRoutes(mux, s, repo)
	return mux, repo
}

func TestWorkloadAPICreateAndRetrieve(t *testing.T) {
	mux, _ := newWorkloadAPITestServer()
	body := `{"id":"api-workload-001","cpu_cores":2,"memory_mb":1024}`

	req := httptest.NewRequest(http.MethodPost, "/api/v1/workloads", strings.NewReader(body))
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rec.Code, rec.Body.String())
	}

	var created storage.Workload
	if err := json.Unmarshal(rec.Body.Bytes(), &created); err != nil {
		t.Fatal(err)
	}
	if created.ID != "api-workload-001" || created.Status != "running" {
		t.Fatalf("unexpected workload response: %+v", created)
	}

	req = httptest.NewRequest(http.MethodGet, "/api/v1/workloads/api-workload-001", nil)
	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestWorkloadAPIList(t *testing.T) {
	mux, repo := newWorkloadAPITestServer()
	if err := repo.Create(context.Background(), storage.Workload{
		ID: "api-list-001", NodeID: "worker-api-test",
		CPUCores: 1, MemoryMB: 512,
	}); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/workloads", nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), `"count":1`) {
		t.Fatalf("expected one workload, got %s", rec.Body.String())
	}
}

func TestWorkloadAPICompleteAndRejectRepeatedCompletion(t *testing.T) {
	mux, repo := newWorkloadAPITestServer()
	if err := repo.Create(context.Background(), storage.Workload{
		ID: "api-complete-001", NodeID: "worker-api-test",
		CPUCores: 2, MemoryMB: 1024,
	}); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost,
		"/api/v1/workloads/api-complete-001/complete", nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	req = httptest.NewRequest(http.MethodPost,
		"/api/v1/workloads/api-complete-001/complete", nil)
	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusConflict {
		t.Fatalf("expected 409 on repeated completion, got %d", rec.Code)
	}
}

func TestWorkloadAPIRejectsInvalidAndMissingWorkloads(t *testing.T) {
	mux, _ := newWorkloadAPITestServer()

	req := httptest.NewRequest(http.MethodPost, "/api/v1/workloads",
		strings.NewReader(`{"id":"","cpu_cores":0,"memory_mb":0}`))
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}

	req = httptest.NewRequest(http.MethodGet, "/api/v1/workloads/missing", nil)
	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, req)
	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rec.Code)
	}
}

func TestWorkloadAPIRejectsDuplicateID(t *testing.T) {
	mux, repo := newWorkloadAPITestServer()
	workload := storage.Workload{
		ID: "api-duplicate-001", NodeID: "worker-api-test",
		CPUCores: 1, MemoryMB: 512,
	}
	if err := repo.Create(context.Background(), workload); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/workloads",
		strings.NewReader(`{"id":"api-duplicate-001","cpu_cores":1,"memory_mb":512}`))
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d", rec.Code)
	}
}

var _ = errors.Is
