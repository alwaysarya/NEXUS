package api

import (
	"encoding/json"
	"net/http"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/host"
)

func RealMetricsHandler(w http.ResponseWriter, r *http.Request) {
	cpuPercent, _ := cpu.Percent(0, false)
	vmStat, _ := mem.VirtualMemory()
	hostInfo, _ := host.Info()

	metrics := map[string]interface{}{
		"cpu": map[string]interface{}{
			"usage":  cpuPercent[0],
			"cores":  len(cpuPercent),
		},
		"memory": map[string]interface{}{
			"total":       vmStat.Total,
			"used":        vmStat.Used,
			"usage_percent": vmStat.UsedPercent,
		},
		"host": map[string]interface{}{
			"os":       hostInfo.OS,
			"platform": hostInfo.Platform,
			"uptime":   hostInfo.Uptime,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}
