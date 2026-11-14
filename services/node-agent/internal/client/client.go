package client

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/alwaysarya/nexus/services/node-agent/internal/config"
	"github.com/alwaysarya/nexus/services/node-agent/internal/system"
)

type Client struct {
	baseURL    string
	httpClient *http.Client
}

type registrationRequest struct {
	ID       string `json:"id"`
	Hostname string `json:"hostname"`
	CPUCores int    `json:"cpu_cores"`
	MemoryMB int64  `json:"memory_mb"`
}

func New(cfg config.Config) *Client {
	return &Client{
		baseURL: strings.TrimRight(cfg.ControlPlaneURL, "/"),
		httpClient: &http.Client{
			Timeout: cfg.RequestTimeout,
		},
	}
}

func (c *Client) Register(ctx context.Context, nodeID string, info system.Info) error {
	payload := registrationRequest{
		ID:       nodeID,
		Hostname: info.Hostname,
		CPUCores: info.CPUCores,
		MemoryMB: info.MemoryMB,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("encode registration request: %w", err)
	}

	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		c.baseURL+"/api/v1/nodes",
		bytes.NewReader(body),
	)
	if err != nil {
		return fmt.Errorf("create registration request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("send registration request: %w", err)
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusCreated:
		return nil
	case http.StatusConflict:
		return nil
	default:
		return fmt.Errorf("registration failed with HTTP status %d", resp.StatusCode)
	}
}

// Heartbeat sends the node's liveness signal to the Control Plane.
func (c *Client) Heartbeat(ctx context.Context, nodeID string) error {
	req, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		c.baseURL+"/api/v1/nodes/"+nodeID+"/heartbeat",
		nil,
	)
	if err != nil {
		return fmt.Errorf("create heartbeat request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("send heartbeat request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("heartbeat failed with HTTP status %d", resp.StatusCode)
	}

	return nil
}

type Workload struct {
	ID       string   `json:"id"`
	NodeID   string   `json:"node_id"`
	CPUCores int      `json:"cpu_cores"`
	MemoryMB int64    `json:"memory_mb"`
	Image    string   `json:"image"`
	Command  []string `json:"command"`
}

func (c *Client) ClaimNext(ctx context.Context, nodeID string) (*Workload, error) {
	endpoint := c.baseURL + "/api/v1/nodes/" + url.PathEscape(nodeID) + "/workloads/next"
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, nil)
	if err != nil {
		return nil, err
	}
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("claim workload: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusNoContent {
		return nil, nil
	}
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("claim workload returned HTTP %d", resp.StatusCode)
	}
	var workload Workload
	if err := json.NewDecoder(resp.Body).Decode(&workload); err != nil {
		return nil, err
	}
	return &workload, nil
}

func (c *Client) ReportRunning(ctx context.Context, nodeID, workloadID, containerID string) error {
	return c.postJSON(ctx, "/api/v1/nodes/"+url.PathEscape(nodeID)+"/workloads/"+url.PathEscape(workloadID)+"/running",
		map[string]string{"container_id": containerID})
}

func (c *Client) ReportFailure(ctx context.Context, nodeID, workloadID, message string) error {
	return c.postJSON(ctx, "/api/v1/nodes/"+url.PathEscape(nodeID)+"/workloads/"+url.PathEscape(workloadID)+"/failed",
		map[string]string{"error": message})
}

func (c *Client) postJSON(ctx context.Context, path string, payload any) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL+path, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		detail, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
		return fmt.Errorf("API returned HTTP %d: %s", resp.StatusCode, strings.TrimSpace(string(detail)))
	}
	return nil
}
