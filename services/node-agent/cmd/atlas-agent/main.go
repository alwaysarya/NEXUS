package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"runtime"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
)

type NodePayload struct {
	Hostname  string `json:"hostname"`
	IPAddress string `json:"ip_address"`
	CPUCores  int    `json:"cpu_cores"`
	MemoryMB  int64  `json:"memory_mb"`
}

var registeredNodeID string
var dockerCli *client.Client
var runningWorkloads = make(map[string]bool)

func main() {
	fmt.Println("🤖 Starting NEXUS Node Agent...")
	
	var err error
	dockerCli, err = client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatalf("❌ Failed to connect to Docker: %v", err)
	}
	fmt.Println("🐳 Connected to Docker daemon")

	hostname := "agent-node-mac"
	cpuCores := runtime.NumCPU()
	memoryMB := int64(16384)
	
	payload := NodePayload{
		Hostname:  hostname,
		IPAddress: "127.0.0.1",
		CPUCores:  cpuCores,
		MemoryMB:  memoryMB,
	}

	jsonData, _ := json.Marshal(payload)
	fmt.Println("Registering with Control Plane...")
	resp, err := http.Post("http://localhost:8080/api/v1/nodes", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Fatalf("Error connecting: %v", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	registeredNodeID = result["id"].(string)
	
	fmt.Printf("✅ Registered! Node ID: %s\n", registeredNodeID)
	fmt.Println("Starting heartbeat & workload sync...")
	
	for {
		time.Sleep(10 * time.Second)
		
		statusPayload := map[string]string{"status": "active"}
		statusJSON, _ := json.Marshal(statusPayload)
		req, _ := http.NewRequest(http.MethodPatch, fmt.Sprintf("http://localhost:8080/api/v1/nodes/%s/status", registeredNodeID), bytes.NewBuffer(statusJSON))
		req.Header.Set("Content-Type", "application/json")
		httpClient := &http.Client{}
		res, err := httpClient.Do(req)
		if err == nil && res.StatusCode == 200 {
			fmt.Println("💓 Heartbeat sent (status: active)")
		}
		if res != nil { res.Body.Close() }

		wlResp, err := http.Get(fmt.Sprintf("http://localhost:8080/api/v1/nodes/%s/workloads", registeredNodeID))
		if err == nil && wlResp.StatusCode == 200 {
			var workloads []map[string]interface{}
			json.NewDecoder(wlResp.Body).Decode(&workloads)
			wlResp.Body.Close()

			for _, w := range workloads {
				id := w["id"].(string)
				image := w["image"].(string)
				
				if !runningWorkloads[id] {
					fmt.Printf("📦 Starting container for workload %s (Image: %s)\n", id, image)
					err := runDockerContainer(id, image)
					if err != nil {
						fmt.Printf("❌ Failed to start container: %v\n", err)
					} else {
						runningWorkloads[id] = true
						fmt.Printf("✅ Container started successfully for %s\n", id)
					}
				}
			}
		}
	}
}

func runDockerContainer(workloadID string, imageName string) error {
	ctx := context.Background()

	reader, err := dockerCli.ImagePull(ctx, imageName, image.PullOptions{})
	if err != nil {
		return err
	}
	defer reader.Close()
	io.Copy(io.Discard, reader)

	containerName := fmt.Sprintf("nexus-wl-%s", workloadID[:8])
	
	resp, err := dockerCli.ContainerCreate(ctx, &container.Config{
		Image: imageName,
		Cmd:   []string{"sleep", "infinity"},
	}, nil, nil, nil, containerName)
	if err != nil {
		return err
	}

	return dockerCli.ContainerStart(ctx, resp.ID, container.StartOptions{})
}
