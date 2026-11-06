CREATE TABLE IF NOT EXISTS nodes (
    id              VARCHAR(128) PRIMARY KEY,
    hostname        VARCHAR(255) NOT NULL,
    cpu_cores       INTEGER NOT NULL CHECK (cpu_cores BETWEEN 1 AND 4096),
    memory_mb       BIGINT NOT NULL CHECK (memory_mb BETWEEN 1 AND 1099511627776),
    status          VARCHAR(16) NOT NULL DEFAULT 'registered'
                    CHECK (status IN ('registered', 'online', 'offline')),
    registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_heartbeat  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_nodes_status
    ON nodes(status);

CREATE INDEX IF NOT EXISTS idx_nodes_last_heartbeat
    ON nodes(last_heartbeat);
