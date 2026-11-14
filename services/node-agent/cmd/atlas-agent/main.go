package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/alwaysarya/nexus/services/node-agent/internal/client"
	"github.com/alwaysarya/nexus/services/node-agent/internal/config"
	"github.com/alwaysarya/nexus/services/node-agent/internal/retry"
	containerruntime "github.com/alwaysarya/nexus/services/node-agent/internal/runtime"
	"github.com/alwaysarya/nexus/services/node-agent/internal/system"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Configuration error: %v", err)
	}

	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)
	defer stop()

	info, err := system.Collect()
	if err != nil {
		log.Fatalf("System information error: %v", err)
	}

	nexusClient := client.New(cfg)

	log.Printf("NEXUS Node Agent starting: %s", cfg.NodeID)
	log.Printf("Hostname: %s | CPU: %d | RAM: %d MB",
		info.Hostname, info.CPUCores, info.MemoryMB)

	err = retry.Do(ctx, time.Second, 30*time.Second,
		func(ctx context.Context) error {
			requestCtx, cancel := context.WithTimeout(ctx, cfg.RequestTimeout)
			defer cancel()

			err := nexusClient.Register(requestCtx, cfg.NodeID, info)
			if err == nil {
				log.Printf("Node %s registered successfully", cfg.NodeID)
			}
			return err
		},
	)
	if err != nil {
		if !errors.Is(err, context.Canceled) {
			log.Printf("Registration stopped: %v", err)
		}
		return
	}

	if err := sendHeartbeatWithRetry(ctx, nexusClient, cfg); err != nil {
		log.Printf("Heartbeat stopped: %v", err)
		return
	}

	docker := containerruntime.NewDocker()
	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()
	log.Println("NEXUS workload polling started")

	for {
		select {
		case <-ctx.Done():
			log.Println("NEXUS Node Agent shutting down")
			return
		case <-ticker.C:
			if err := sendHeartbeatWithRetry(ctx, nexusClient, cfg); err != nil {
				if errors.Is(err, context.Canceled) {
					return
				}
				log.Printf("Heartbeat error: %v", err)
				continue
			}
			if err := processWorkload(ctx, nexusClient, docker, cfg); err != nil {
				log.Printf("Workload processing: %v", err)
			}
		}
	}
}

func processWorkload(ctx context.Context, c *client.Client, docker *containerruntime.Docker, cfg config.Config) error {
	requestCtx, cancel := context.WithTimeout(ctx, cfg.RequestTimeout)
	workload, err := c.ClaimNext(requestCtx, cfg.NodeID)
	cancel()
	if err != nil || workload == nil {
		return err
	}

	log.Printf("Deploying workload %s using %s", workload.ID, workload.Image)
	runCtx, runCancel := context.WithTimeout(ctx, 5*time.Minute)
	containerID, err := docker.Run(runCtx, workload.ID, workload.Image,
		workload.CPUCores, workload.MemoryMB, workload.Command)
	runCancel()

	reportCtx, reportCancel := context.WithTimeout(ctx, cfg.RequestTimeout)
	defer reportCancel()

	if err != nil {
		if reportErr := c.ReportFailure(reportCtx, cfg.NodeID, workload.ID, err.Error()); reportErr != nil {
			return fmt.Errorf("Docker error: %v; report error: %w", err, reportErr)
		}
		return err
	}

	if err := c.ReportRunning(reportCtx, cfg.NodeID, workload.ID, containerID); err != nil {
		return fmt.Errorf("container started but status report failed: %w", err)
	}
	log.Printf("Workload %s running: %s", workload.ID, containerID)
	return nil
}

func sendHeartbeatWithRetry(ctx context.Context, c *client.Client, cfg config.Config) error {
	return retry.Do(ctx, time.Second, 30*time.Second, func(ctx context.Context) error {
		requestCtx, cancel := context.WithTimeout(ctx, cfg.RequestTimeout)
		defer cancel()
		err := c.Heartbeat(requestCtx, cfg.NodeID)
		if err == nil {
			log.Printf("Heartbeat successful: %s", cfg.NodeID)
		}
		return err
	})
}
