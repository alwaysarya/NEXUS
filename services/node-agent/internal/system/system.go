package system

import (
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
)

type Info struct {
	Hostname string
	CPUCores int
	MemoryMB int64
}

func Collect() (Info, error) {
	hostname, err := os.Hostname()
	if err != nil {
		return Info{}, fmt.Errorf("detect hostname: %w", err)
	}

	memoryMB, err := totalMemoryMB()
	if err != nil {
		return Info{}, err
	}

	return Info{
		Hostname: hostname,
		CPUCores: runtime.NumCPU(),
		MemoryMB: memoryMB,
	}, nil
}

func totalMemoryMB() (int64, error) {
	var command *exec.Cmd

	switch runtime.GOOS {
	case "darwin":
		command = exec.Command("sysctl", "-n", "hw.memsize")
	case "linux":
		command = exec.Command("sh", "-c", "awk '/MemTotal/ {print $2 * 1024}' /proc/meminfo")
	default:
		return 0, fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}

	output, err := command.Output()
	if err != nil {
		return 0, fmt.Errorf("detect system memory: %w", err)
	}

	bytes, err := strconv.ParseInt(strings.TrimSpace(string(output)), 10, 64)
	if err != nil {
		return 0, fmt.Errorf("parse system memory: %w", err)
	}

	if bytes <= 0 {
		return 0, fmt.Errorf("detected invalid system memory: %d bytes", bytes)
	}

	return bytes / (1024 * 1024), nil
}
