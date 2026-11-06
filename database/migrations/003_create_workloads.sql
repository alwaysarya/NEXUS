CREATE TABLE IF NOT EXISTS workloads (
    id              VARCHAR(128) PRIMARY KEY,
    node_id         VARCHAR(128) NOT NULL REFERENCES nodes(id) ON DELETE RESTRICT,
    cpu_cores       INTEGER NOT NULL CHECK (cpu_cores > 0),
    memory_mb       BIGINT NOT NULL CHECK (memory_mb > 0),
    status          VARCHAR(16) NOT NULL DEFAULT 'running'
                    CHECK (status IN ('running', 'completed')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,

    CONSTRAINT workloads_completion_consistency
    CHECK (
        (status = 'running' AND completed_at IS NULL)
        OR
        (status = 'completed' AND completed_at IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_workloads_node_id
    ON workloads(node_id);

CREATE INDEX IF NOT EXISTS idx_workloads_status
    ON workloads(status);

CREATE INDEX IF NOT EXISTS idx_workloads_created_at
    ON workloads(created_at DESC);
