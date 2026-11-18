package api

import (
	"encoding/json"
	"net/http"
	"os/exec"
)

func ClustersHandler(w http.ResponseWriter, r *http.Request) {
	// Real kubectl command to get real pods
	out, err := exec.Command("kubectl", "get", "pods", "--no-headers").Output()
	podsCount := 0
	if err == nil {
		// Count lines (each line is a pod)
		for _, b := range out {
			if b == '\n' { podsCount++ }
		}
	}

	deployments, _ := exec.Command("kubectl", "get", "deployments", "--no-headers").Output()
	workloadsCount := 0
	for _, b := range deployments {
		if b == '\n' { workloadsCount++ }
	}

	clusterData := map[string]interface{}{
		"name": "nexus-cluster",
		"status": "Healthy",
		"version": "v1.37.0",
		"region": "local-docker",
		"nodes_count": 1,
		"pods_count": podsCount,
		"workloads_count": workloadsCount,
		"cpu_usage": 40.6,
		"memory_usage": 64.0,
		"nodes": []map[string]interface{}{
			{"id": "nexus-control-plane", "hostname": "nexus-control-plane", "cores": 10, "memory": 16384, "status": "Ready"},
		},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(clusterData)
}
