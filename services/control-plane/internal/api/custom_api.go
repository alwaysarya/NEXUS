package api

import (
	"encoding/json"
	"net/http"
)

type NodeData struct {
	Name         string  `json:"name"`
	Status       string  `json:"status"`
	Zone         string  `json:"zone"`
	InstanceType string  `json:"instanceType"`
	CPU          float64 `json:"cpu"`
	Memory       float64 `json:"memory"`
	Pods         string  `json:"pods"`
	Age          string  `json:"age"`
}

func CustomHealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy", "uptime": "99.98%"})
}

func CustomNodesHandler(w http.ResponseWriter, r *http.Request) {
	nodes := []NodeData{
		{Name: "ip-10-0-1-23", Status: "Ready", Zone: "us-east-1a", InstanceType: "m6i.2xlarge", CPU: 38, Memory: 61, Pods: "14 / 32", Age: "4 mo"},
		{Name: "ip-10-0-1-24", Status: "Ready", Zone: "us-east-1a", InstanceType: "m6i.2xlarge", CPU: 41, Memory: 63, Pods: "13 / 32", Age: "4 mo"},
		{Name: "ip-10-0-2-20", Status: "NotReady", Zone: "us-east-1b", InstanceType: "m6i.2xlarge", CPU: 0, Memory: 0, Pods: "0 / 32", Age: "12 min"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nodes)
}
