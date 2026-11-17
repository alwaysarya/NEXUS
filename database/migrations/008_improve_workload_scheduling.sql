-- Preserve existing workloads while supporting unassigned pending workloads.
ALTER TABLE workloads
    ALTER COLUMN node_id DROP NOT NULL;

ALTER TABLE workloads
    ADD COLUMN IF NOT EXISTS name VARCHAR(255) NOT NULL DEFAULT '';

-- Give older workloads a useful display name.
UPDATE workloads
SET name = image
WHERE name = '';

-- Allow pending, deploying and failed workloads without completion timestamps.
ALTER TABLE workloads
    DROP CONSTRAINT IF EXISTS workloads_completion_consistency;

ALTER TABLE workloads
    ADD CONSTRAINT workloads_completion_consistency
    CHECK (
        (status <> 'completed' AND completed_at IS NULL)
        OR
        (status = 'completed' AND completed_at IS NOT NULL)
    );
