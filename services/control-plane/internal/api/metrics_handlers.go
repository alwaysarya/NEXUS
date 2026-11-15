package api

import (
	"encoding/json"
	"net/http"
	"math/rand"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/net"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/process"
)

func RealMetricsHandler(w http.ResponseWriter, r *http.Request) {
	env := r.URL.Query().Get("env")
	if env == "" { env = "production" }

	cpuPercent, _ := cpu.Percent(0, false)
	vmStat, _ := mem.VirtualMemory()
	hostInfo, _ := host.Info()

	// Agar Staging hai, toh thoda alag data dikhao (simulate)
	displayCPU := cpuPercent[0]
	displayMem := vmStat.UsedPercent
	displayHost := hostInfo.Platform

	if env == "staging" {
		displayCPU = cpuPercent[0] * 0.5 // Staging uses half resources
		displayMem = vmStat.UsedPercent * 0.8
		displayHost = hostInfo.Platform + " (Staging)"
	} else if env == "development" {
		displayCPU = rand.Float64() * 10
		displayMem = rand.Float64() * 30
		displayHost = hostInfo.Platform + " (Dev)"
	}

	metrics := map[string]interface{}{
		"cpu": map[string]interface{}{"usage": displayCPU, "cores": len(cpuPercent)},
		"memory": map[string]interface{}{"total": vmStat.Total, "used": vmStat.Used, "usage_percent": displayMem},
		"host": map[string]interface{}{"os": hostInfo.OS, "platform": displayHost, "uptime": hostInfo.Uptime},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}

// ... (baaki handlers waise hi rahenge)

func NetworkMetricsHandler(w http.ResponseWriter, r *http.Request) {
	netIO, _ := net.IOCounters(false)
	var bytesSent, bytesRecv uint64
	if len(netIO) > 0 {
		bytesSent = netIO[0].BytesSent
		bytesRecv = netIO[0].BytesRecv
	}
	conns, _ := net.Connections("all")
	netData := map[string]interface{}{"bytes_sent": bytesSent, "bytes_recv": bytesRecv, "active_connections": len(conns)}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(netData)
}

func StorageMetricsHandler(w http.ResponseWriter, r *http.Request) {
	diskStat, _ := disk.Usage("/")
	partitions, _ := disk.Partitions(false)
	var disks []map[string]interface{}
	for _, p := range partitions {
		usage, _ := disk.Usage(p.Mountpoint)
		if usage.Total > 0 {
			disks = append(disks, map[string]interface{}{"path": p.Mountpoint, "total": usage.Total, "used": usage.Used, "free": usage.Free, "used_percent": usage.UsedPercent})
		}
	}
	storageData := map[string]interface{}{"total": diskStat.Total, "used": diskStat.Used, "free": diskStat.Free, "used_percent": diskStat.UsedPercent, "volumes": disks}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(storageData)
}

func ObservabilityMetricsHandler(w http.ResponseWriter, r *http.Request) {
	cpuPercent, _ := cpu.Percent(0, false)
	vmStat, _ := mem.VirtualMemory()
	netIO, _ := net.IOCounters(false)
	var netRecv, netSent uint64
	if len(netIO) > 0 { netRecv = netIO[0].BytesRecv; netSent = netIO[0].BytesSent }
	obsData := map[string]interface{}{"cpu_usage": cpuPercent[0], "memory_usage": vmStat.UsedPercent, "network_recv": netRecv, "network_sent": netSent}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(obsData)
}

func AutomationMetricsHandler(w http.ResponseWriter, r *http.Request) {
	procs, _ := process.Processes()
	type ProcInfo struct { PID int32 `json:"pid"`; Name string `json:"name"`; CPU float64 `json:"cpu"`; MEM float32 `json:"mem"` }
	var procsList []ProcInfo
	for _, p := range procs {
		name, _ := p.Name()
		cpuPercent, _ := p.CPUPercent()
		memPercent, _ := p.MemoryPercent()
		if cpuPercent > 0.1 { procsList = append(procsList, ProcInfo{PID: p.Pid, Name: name, CPU: cpuPercent, MEM: memPercent}) }
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(procsList)
}

func TracesMetricsHandler(w http.ResponseWriter, r *http.Request) {
	procs, _ := process.Processes()
	type TraceInfo struct { ID int32 `json:"id"`; Service string `json:"service"`; Duration string `json:"duration"`; Status string `json:"status"` }
	var traces []TraceInfo
	for i, p := range procs {
		if i > 10 { break }
		name, _ := p.Name()
		traces = append(traces, TraceInfo{ID: p.Pid, Service: name, Duration: "128ms", Status: "200 OK"})
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(traces)
}

func AlertsMetricsHandler(w http.ResponseWriter, r *http.Request) {
	cpuPercent, _ := cpu.Percent(0, false)
	vmStat, _ := mem.VirtualMemory()
	type Alert struct { Title string `json:"title"`; Severity string `json:"severity"`; Message string `json:"message"`; Time string `json:"time"` }
	var alerts []Alert
	if cpuPercent[0] > 70 { alerts = append(alerts, Alert{Title: "High CPU Usage", Severity: "Critical", Message: "CPU usage above 70%", Time: "Now"}) }
	if vmStat.UsedPercent > 80 { alerts = append(alerts, Alert{Title: "High Memory Usage", Severity: "Critical", Message: "Memory usage above 80%", Time: "Now"}) }
	if len(alerts) == 0 { alerts = append(alerts, Alert{Title: "System Healthy", Severity: "Low", Message: "All systems normal", Time: "Now"}) }
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(alerts)
}

func SecurityMetricsHandler(w http.ResponseWriter, r *http.Request) {
	hostInfo, _ := host.Info()
	securityData := map[string]interface{}{"os": hostInfo.OS, "platform": hostInfo.Platform, "hostname": hostInfo.Hostname, "uptime": hostInfo.Uptime}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(securityData)
}

func CostMetricsHandler(w http.ResponseWriter, r *http.Request) {
	vmStat, _ := mem.VirtualMemory()
	diskStat, _ := disk.Usage("/")
	computeCost := (vmStat.UsedPercent / 100) * 500
	storageCost := (diskStat.UsedPercent / 100) * 200
	netCost := 150.00
	costData := map[string]interface{}{"compute": computeCost, "storage": storageCost, "network": netCost, "total": computeCost + storageCost + netCost}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(costData)
}
