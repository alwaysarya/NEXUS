CREATE TABLE IF NOT EXISTS deployments (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    environment VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
