package api

import "context"

type contextKey string

const agentNodeIDKey contextKey = "agentNodeID"

func AgentNodeIDFromContext(ctx context.Context) (string, bool) {
	nodeID, ok := ctx.Value(agentNodeIDKey).(string)
	return nodeID, ok
}

func WithAgentNodeID(ctx context.Context, nodeID string) context.Context {
	return context.WithValue(ctx, agentNodeIDKey, nodeID)
}
