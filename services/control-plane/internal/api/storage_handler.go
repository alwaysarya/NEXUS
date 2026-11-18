package api

import (
	"encoding/json"
	"net/http"
	"github.com/shirou/gopsutil/v3/disk"
)

func StoragePageHandler(w http.ResponseWriter, r *http.Request) {
	partitions, _ := disk.Partitions(false)
	var volumes []map[string]interface{}
	
	for _, p := range partitions {
		usage, err := disk.Usage(p.Mountpoint)
		if err == nil && usage.Total > 0 {
			volumes = append(volumes, map[string]interface{}{
				"path":         p.Mountpoint,
				"capacity":     usage.Total,
				"used":         usage.Used,
				"free":         usage.Free,
				"usage_percent": usage.UsedPercent,
			})
		}
	}

	rootUsage, _ := disk.Usage("/")

	data := map[string]interface{}{
		"total_storage": rootUsage.Total,
		"used_storage":  rootUsage.Used,
		"free_storage":  rootUsage.Free,
		"usage_percent": rootUsage.UsedPercent,
		"volumes":       volumes,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
