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

func main() {
	fmt.Println("Starting NEXUS Node Agent...")
	
	// Get System Info
	hostname := "agent-node-1"
	cpuCores := runtime.NumCPU()
	memoryMB := int64(8192) // Dummy 8GB for now
	
	payload := NodePayload{
		Hostname:  hostname,
		IPAddress: "127.0.0.1",
		CPUCores:  cpuCores,
		MemoryMB:  memoryMB,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		log.Fatalf("Error marshaling JSON: %v", err)
	}

	// Send to Control Plane
	fmt.Println("Registering with Control Plane...")
	resp, err := http.Post("http://localhost:8080/api/v1/nodes", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Fatalf("Error connecting to Control Plane: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		log.Fatalf("Failed to register. Status: %d", resp.StatusCode)
	}

	fmt.Println("Successfully registered!")
	
	// Heartbeat Loop (Har 10 second baad server ko batayega ki zinda hai)
	for {
		time.Sleep(10 * time.Second)
		fmt.Println("Sending heartbeat...")
		// Yahan hum baad mein PATCH request bhejenge status update ke liye
	}
}
