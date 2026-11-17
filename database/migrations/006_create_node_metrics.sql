CREATE TABLE IF NOT EXISTS node_metrics (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    node_id VARCHAR(128) NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    cpu_percent DOUBLE PRECISION NOT NULL CHECK (cpu_percent BETWEEN 0 AND 100),
    memory_total_bytes BIGINT NOT NULL,
    memory_used_bytes BIGINT NOT NULL,
    disk_total_bytes BIGINT NOT NULL,
    disk_used_bytes BIGINT NOT NULL,
    network_sent_bytes BIGINT NOT NULL,
    network_recv_bytes BIGINT NOT NULL,
    collected_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_node_metrics_node_time
ON node_metrics(node_id, collected_at DESC);
