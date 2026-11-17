CREATE TABLE IF NOT EXISTS traffic_history (
    id SERIAL PRIMARY KEY,
    node_id VARCHAR(255) NOT NULL,
    recv_bytes BIGINT NOT NULL,
    sent_bytes BIGINT NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
