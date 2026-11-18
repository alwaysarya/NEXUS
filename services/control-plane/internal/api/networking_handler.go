package api

import (
	"encoding/json"
	"net/http"
	"github.com/shirou/gopsutil/v3/net"
)

func NetworkingHandler(w http.ResponseWriter, r *http.Request) {
	netIO, _ := net.IOCounters(false)
	var bytesSent, bytesRecv uint64
	if len(netIO) > 0 {
		bytesSent = netIO[0].BytesSent
		bytesRecv = netIO[0].BytesRecv
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

	data := map[string]interface{}{
		"bytes_sent":         bytesSent,
		"bytes_recv":         bytesRecv,
		"active_connections": len(conns),
		"interfaces":         interfaces,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
