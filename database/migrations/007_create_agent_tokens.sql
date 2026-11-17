CREATE TABLE IF NOT EXISTS agent_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_id VARCHAR(128) NOT NULL UNIQUE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_tokens_active
ON agent_tokens(node_id)
WHERE revoked_at IS NULL;
