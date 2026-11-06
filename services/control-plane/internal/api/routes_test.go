package api

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"sort"
	"sync"
	"testing"
	"time"

	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
)

type fakeNodeRepository struct {
	mu    sync.RWMutex
	nodes map[string]storage.Node
}

func newFakeNodeRepository() *fakeNodeRepository {
	return &fakeNodeRepository{nodes: make(map[string]storage.Node)}
}

func (repo *fakeNodeRepository) Register(_ context.Context, node storage.Node) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	if _, exists := repo.nodes[node.ID]; exists {
		return storage.ErrNodeAlreadyExists
	}

	repo.nodes[node.ID] = node
	return nil
}

func (repo *fakeNodeRepository) GetByID(_ context.Context, id string) (storage.Node, error) {
	repo.mu.RLock()
	defer repo.mu.RUnlock()

	node, exists := repo.nodes[id]
	if !exists {
		return storage.Node{}, storage.ErrNodeNotFound
	}
	return node, nil
}

func (repo *fakeNodeRepository) List(_ context.Context) ([]storage.Node, error) {
	repo.mu.RLock()
	defer repo.mu.RUnlock()

	nodes := make([]storage.Node, 0, len(repo.nodes))
	for _, node := range repo.nodes {
		nodes = append(nodes, node)
	}

	sort.Slice(nodes, func(i, j int) bool {
		return nodes[i].ID < nodes[j].ID
	})
	return nodes, nil
}

func (repo *fakeNodeRepository) Heartbeat(_ context.Context, id string, timestamp time.Time) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	node, exists := repo.nodes[id]
	if !exists {
		return storage.ErrNodeNotFound
	}

	node.Status = "online"
	node.LastHeartbeat = &timestamp
	repo.nodes[id] = node
	return nil
}

func (repo *fakeNodeRepository) MarkOfflineNodes(_ context.Context, before time.Time) error {
	repo.mu.Lock()
	defer repo.mu.Unlock()

	for id, node := range repo.nodes {
		lastSeen := node.RegisteredAt
		if node.LastHeartbeat != nil {
			lastSeen = *node.LastHeartbeat
		}
		if lastSeen.Before(before) {
			node.Status = "offline"
			repo.nodes[id] = node
		}
	}
	return nil
}

func newTestServer() (*http.ServeMux, *fakeNodeRepository) {
	mux := http.NewServeMux()
	repository := newFakeNodeRepository()
	nodeAPI := NewNodeAPI(repository)
	RegisterRoutes(mux, nodeAPI)
	return mux, repository
}

func TestHealthEndpoint(t *testing.T) {
	mux, _ := newTestServer()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestRegisterNode(t *testing.T) {
	mux, _ := newTestServer()
	body := `{"id":"node-001","hostname":"worker-01","cpu_cores":8,"memory_mb":16384}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/nodes", bytes.NewBufferString(body))
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestDuplicateNodeRegistration(t *testing.T) {
	mux, _ := newTestServer()
	body := `{"id":"node-001","hostname":"worker-01","cpu_cores":8,"memory_mb":16384}`

	for i := 0; i < 2; i++ {
		req := httptest.NewRequest(http.MethodPost, "/api/v1/nodes", bytes.NewBufferString(body))
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, req)

		expected := http.StatusCreated
		if i == 1 {
			expected = http.StatusConflict
		}
		if rec.Code != expected {
			t.Fatalf("attempt %d: expected %d, got %d", i+1, expected, rec.Code)
		}
	}
}

func TestInvalidNodeRequests(t *testing.T) {
	tests := []struct {
		name string
		body string
	}{
		{"missing hostname", `{"id":"node-001","cpu_cores":8,"memory_mb":1024}`},
		{"invalid CPU", `{"id":"node-001","hostname":"worker-01","cpu_cores":0,"memory_mb":1024}`},
		{"invalid JSON", `{"id":`},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			mux, _ := newTestServer()
			req := httptest.NewRequest(http.MethodPost, "/api/v1/nodes", bytes.NewBufferString(tc.body))
			rec := httptest.NewRecorder()
			mux.ServeHTTP(rec, req)

			if rec.Code != http.StatusBadRequest {
				t.Fatalf("expected 400, got %d", rec.Code)
			}
		})
	}
}

func TestListNodes(t *testing.T) {
	mux, _ := newTestServer()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/nodes", nil)
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}

	var response struct {
		Count int    `json:"count"`
		Nodes []Node `json:"nodes"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		t.Fatal(err)
	}
	if response.Count != 0 {
		t.Fatalf("expected 0 nodes, got %d", response.Count)
	}
}

func TestHeartbeatRestoresOfflineNode(t *testing.T) {
	mux, repository := newTestServer()

	node := storage.Node{
		ID:           "node-1",
		Hostname:     "test-node",
		Status:       "offline",
		RegisteredAt: time.Now().UTC().Add(-time.Minute),
	}
	if err := repository.Register(context.Background(), node); err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/nodes/node-1/heartbeat", nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	updated, err := repository.GetByID(context.Background(), "node-1")
	if err != nil {
		t.Fatal(err)
	}
	if updated.Status != "online" {
		t.Fatalf("expected online after heartbeat, got %s", updated.Status)
	}
}

func TestHeartbeatUnknownNode(t *testing.T) {
	mux, _ := newTestServer()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/nodes/unknown/heartbeat", nil)
	rec := httptest.NewRecorder()

	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rec.Code)
	}
}

func TestRepositoryNotFoundError(t *testing.T) {
	if !errors.Is(storage.ErrNodeNotFound, storage.ErrNodeNotFound) {
		t.Fatal("expected node not found sentinel error")
	}
}
