package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"runtime"
	"time"
)

type NodePayload struct {
	Hostname  string `json:"hostname"`
	IPAddress string `json:"ip_address"`
	CPUCores  int    `json:"cpu_cores"`
	MemoryMB  int64  `json:"memory_mb"`
}

// Global variable to store our ID
var registeredNodeID string

func main() {
	fmt.Println("🤖 Starting NEXUS Node Agent...")
	
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

	// Register with Control Plane
	fmt.Println("Registering with Control Plane...")
	resp, err := http.Post("http://localhost:8080/api/v1/nodes", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Fatalf("Error connecting: %v", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	registeredNodeID = result["id"].(string)
	
	fmt.Printf("✅ Successfully registered! Node ID: %s\n", registeredNodeID)
	fmt.Println("Starting heartbeat loop (every 10s)...")
	
	// Heartbeat Loop
	for {
		time.Sleep(10 * time.Second)
		
		// Update status to active
		statusPayload := map[string]string{"status": "active"}
		statusJSON, _ := json.Marshal(statusPayload)
		
		req, _ := http.NewRequest(http.MethodPatch, fmt.Sprintf("http://localhost:8080/api/v1/nodes/%s/status", registeredNodeID), bytes.NewBuffer(statusJSON))
		req.Header.Set("Content-Type", "application/json")
		
		client := &http.Client{}
		_, err := client.Do(req)
		if err != nil {
			fmt.Printf("❌ Heartbeat failed: %v\n", err)
		} else {
			fmt.Println("💓 Heartbeat sent (status: active)")
		}
	}
}
