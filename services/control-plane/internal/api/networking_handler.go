package api

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"
	"github.com/shirou/gopsutil/v3/net"
)

var (
	lastBytesSent uint64
	lastBytesRecv uint64
	lastTime      = time.Now()
	mu            sync.Mutex
)

func NetworkingHandler(w http.ResponseWriter, r *http.Request) {
	mu.Lock()
	defer mu.Unlock()

	netIO, _ := net.IOCounters(false)
	var currentSent, currentRecv uint64
	if len(netIO) > 0 {
		currentSent = netIO[0].BytesSent
		currentRecv = netIO[0].BytesRecv
	}

	conns, _ := net.Connections("all")

	ifaces, _ := net.Interfaces()
	var interfaces []map[string]interface{}
	for _, i := range ifaces {
		if len(i.Addrs) > 0 {
			interfaces = append(interfaces, map[string]interface{}{
				"name":   i.Name,
				"status": "Active",
				"type":   "Network",
				"addrs":  i.Addrs[0].Addr,
			})
		}
	}

	if len(interfaces) == 0 {
		interfaces = append(interfaces, map[string]interface{}{
			"name": "en0", "status": "Active", "type": "Wi-Fi", "addrs": "127.0.0.1",
		})
	}

	// Calculate Speed (Bytes per second)
	now := time.Now()
	duration := now.Sub(lastTime).Seconds()
	var speedSent, speedRecv float64

	if duration > 0 && lastBytesSent > 0 {
		speedSent = float64(currentSent-lastBytesSent) / duration
		speedRecv = float64(currentRecv-lastBytesRecv) / duration
	}

	// Update last values for next call
	lastBytesSent = currentSent
	lastBytesRecv = currentRecv
	lastTime = now

	data := map[string]interface{}{
		"total_bytes_sent":   currentSent,
		"total_bytes_recv":   currentRecv,
		"speed_sent":         speedSent,
		"speed_recv":         speedRecv,
		"active_connections": len(conns),
		"interfaces":         interfaces,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
