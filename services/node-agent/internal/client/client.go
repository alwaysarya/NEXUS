package client

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
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
