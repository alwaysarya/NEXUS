-- Persist real operating system and uptime metadata from Node Agents.
-- Existing records remain valid and are not deleted or rewritten.

ALTER TABLE node_metrics
    ADD COLUMN IF NOT EXISTS os_name TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS os_platform TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS os_platform_version TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS uptime_seconds BIGINT NOT NULL DEFAULT 0;
