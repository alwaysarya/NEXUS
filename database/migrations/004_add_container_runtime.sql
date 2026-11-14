ALTER TABLE workloads
    ADD COLUMN IF NOT EXISTS image VARCHAR(512) NOT NULL DEFAULT 'alpine:3.21',
    ADD COLUMN IF NOT EXISTS command JSONB NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS container_id VARCHAR(128),
    ADD COLUMN IF NOT EXISTS error_message TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE workloads
    ALTER COLUMN status SET DEFAULT 'pending';

ALTER TABLE workloads
    DROP CONSTRAINT IF EXISTS workloads_status_check;

ALTER TABLE workloads
    ADD CONSTRAINT workloads_status_check
    CHECK (status IN ('pending', 'deploying', 'running', 'failed', 'completed'));

CREATE INDEX IF NOT EXISTS idx_workloads_pending
    ON workloads(created_at)
    WHERE status = 'pending';
