package node_registry

import "time"

type AuditLog struct {
	ID        string    `json:"id"`
	Action    string    `json:"action"`
	Actor     string    `json:"actor"`
	Resource  string    `json:"resource"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}
