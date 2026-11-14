package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"runtime"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
)

type NodePayload struct {
	Hostname  string `json:"hostname"`
	IPAddress string `json:"ip_address"`
	CPUCores  int    `json:"cpu_cores"`
	MemoryMB  int64  `json:"memory_mb"`
}

var registeredNodeID string
var authToken string
var dockerCli *client.Client
var runningWorkloads = make(map[string]bool)
const nexusNetworkName = "nexus-net"

func authReq(method, url string, body io.Reader) (*http.Response, error) {
	req, err := http.NewRequest(method, url, body)
	if err != nil { return nil, err }
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+authToken)
	httpClient := &http.Client{}
	return httpClient.Do(req)
}

func ensureNetwork(ctx context.Context) {
	networks, _ := dockerCli.NetworkList(ctx, network.ListOptions{})
	for _, n := range networks {
		if n.Name == nexusNetworkName {
			return
		}
	}
	fmt.Println("🌐 Creating NEXUS custom network...")
	dockerCli.NetworkCreate(ctx, nexusNetworkName, network.CreateOptions{Driver: "bridge"})
}

func main() {
	fmt.Println("🤖 Starting NEXUS Node Agent...")
	
	// FIX: Mac ke liye Docker socket path hardcode karna padta hai
	os.Setenv("DOCKER_HOST", "unix:///Users/aryanthakur/.docker/run/docker.sock")

	var err error
	dockerCli, err = client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil { log.Fatalf("❌ Failed to connect to Docker: %v", err) }
	fmt.Println("🐳 Connected to Docker daemon")
	ensureNetwork(context.Background())

	hostname := os.Getenv("NODE_HOSTNAME")
	if hostname == "" { hostname = "agent-node-mac" }
	nodeIP := os.Getenv("NODE_IP")
	if nodeIP == "" { nodeIP = "127.0.0.1" }
	controlPlaneURL := os.Getenv("CONTROL_PLANE_URL")
	if controlPlaneURL == "" { controlPlaneURL = "http://localhost:8080" }

	loginPayload := map[string]string{"username": "admin_nexus", "password": "nexus123"}
	loginJSON, _ := json.Marshal(loginPayload)
	respLogin, _ := http.Post(controlPlaneURL+"/api/v1/login", "application/json", bytes.NewBuffer(loginJSON))
	var loginResult map[string]string
	json.NewDecoder(respLogin.Body).Decode(&loginResult)
	authToken = loginResult["token"]
	respLogin.Body.Close()
	fmt.Println("🔑 Logged in successfully")

	nodesResp, _ := authReq("GET", controlPlaneURL+"/api/v1/nodes", nil)
	var nodes []map[string]interface{}
	json.NewDecoder(nodesResp.Body).Decode(&nodes)
	nodesResp.Body.Close()

	for _, n := range nodes {
		if n["hostname"] == hostname {
			registeredNodeID = n["id"].(string)
			fmt.Printf("✅ Found existing node! Node ID: %s\n", registeredNodeID)
			break
		}
	}

	if registeredNodeID == "" {
		cpuCores := runtime.NumCPU()
		payload := NodePayload{Hostname: hostname, IPAddress: nodeIP, CPUCores: cpuCores, MemoryMB: 16384}
		jsonData, _ := json.Marshal(payload)
		fmt.Printf("Registering new node (%s) with Control Plane...\n", hostname)
		resp, err := authReq("POST", controlPlaneURL+"/api/v1/nodes", bytes.NewBuffer(jsonData))
		if err != nil || resp.StatusCode != http.StatusCreated { log.Fatalf("❌ Failed to register. Status: %v", resp.StatusCode) }
		var result map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&result)
		registeredNodeID = result["id"].(string)
		resp.Body.Close()
		fmt.Printf("✅ Registered! Node ID: %s\n", registeredNodeID)
	}
	
	fmt.Println("Starting heartbeat & workload sync...")
	
	for {
		time.Sleep(10 * time.Second)
		
		statusJSON, _ := json.Marshal(map[string]string{"status": "active"})
		res, _ := authReq(http.MethodPatch, fmt.Sprintf("%s/api/v1/nodes/%s/status", controlPlaneURL, registeredNodeID), bytes.NewBuffer(statusJSON))
		if res != nil { 
			if res.StatusCode == 200 { fmt.Println("💓 Heartbeat sent (status: active)") }
			res.Body.Close() 
		}

		wlResp, err := authReq("GET", fmt.Sprintf("%s/api/v1/nodes/%s/workloads", controlPlaneURL, registeredNodeID), nil)
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
	if err != nil { return err }
	defer reader.Close()
	io.Copy(io.Discard, reader)

	containerName := fmt.Sprintf("nexus-wl-%s", workloadID[:8])
	volumeName := fmt.Sprintf("nexus-vol-%s", workloadID[:8])
	
	resp, err := dockerCli.ContainerCreate(ctx, &container.Config{
		Image: imageName, Cmd: []string{"sleep", "infinity"},
	}, &container.HostConfig{
		NetworkMode: container.NetworkMode(nexusNetworkName),
		Mounts: []mount.Mount{
			{
				Type:   mount.TypeVolume,
				Source: volumeName,
				Target: "/app/data",
			},
		},
	}, nil, nil, containerName)
	if err != nil { return err }
	return dockerCli.ContainerStart(ctx, resp.ID, container.StartOptions{})
}
