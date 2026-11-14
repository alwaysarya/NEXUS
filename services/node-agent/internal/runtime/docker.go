package runtime

import (
	"context"
	"fmt"
	"os/exec"
	"strings"
)

type Docker struct{}

func NewDocker() *Docker { return &Docker{} }

func (d *Docker) Run(ctx context.Context, id, image string, cpu int, memoryMB int64, command []string) (string, error) {
	name := "nexus-" + strings.Map(func(r rune) rune {
		if r >= 'a' && r <= 'z' || r >= 'A' && r <= 'Z' || r >= '0' && r <= '9' || r == '-' || r == '_' || r == '.' {
			return r
		}
		return '-'
	}, id)

	args := []string{"run", "-d", "--name", name,
		"--cpus", fmt.Sprintf("%d", cpu),
		"--memory", fmt.Sprintf("%dm", memoryMB),
		image}
	if len(command) == 0 {
		command = []string{"sleep", "infinity"}
	}
	args = append(args, command...)

	out, err := exec.CommandContext(ctx, "docker", args...).CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("docker run: %w: %s", err, strings.TrimSpace(string(out)))
	}
	return strings.TrimSpace(string(out)), nil
}
