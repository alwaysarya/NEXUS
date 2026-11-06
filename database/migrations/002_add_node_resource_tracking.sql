ALTER TABLE nodes
ADD COLUMN IF NOT EXISTS allocated_cpu_cores INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS allocated_memory_mb BIGINT NOT NULL DEFAULT 0;

ALTER TABLE nodes
ADD CONSTRAINT nodes_allocated_cpu_nonnegative
CHECK (allocated_cpu_cores >= 0);

ALTER TABLE nodes
ADD CONSTRAINT nodes_allocated_memory_nonnegative
CHECK (allocated_memory_mb >= 0);
