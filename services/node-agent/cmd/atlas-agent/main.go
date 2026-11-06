package main

import (
	"context"
	"errors"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/alwaysarya/nexus/services/node-agent/internal/client"
	"github.com/alwaysarya/nexus/services/node-agent/internal/config"
	"github.com/alwaysarya/nexus/services/node-agent/internal/retry"
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

	ticker := time.NewTicker(cfg.HeartbeatInterval)
	defer ticker.Stop()

	log.Printf("Heartbeat interval: %s", cfg.HeartbeatInterval)

	for {
		select {
		case <-ctx.Done():
			log.Println("NEXUS Node Agent shutting down")
			return

		case <-ticker.C:
			if err := sendHeartbeatWithRetry(ctx, nexusClient, cfg); err != nil {
				if errors.Is(err, context.Canceled) {
					log.Println("NEXUS Node Agent shutting down")
					return
				}
				log.Printf("Heartbeat stopped: %v", err)
				return
			}
		}
	}
}

func sendHeartbeatWithRetry(ctx context.Context, c *client.Client, cfg config.Config) error {
	err := retry.Do(ctx, time.Second, 30*time.Second,
		func(ctx context.Context) error {
			requestCtx, cancel := context.WithTimeout(ctx, cfg.RequestTimeout)
			defer cancel()

			err := c.Heartbeat(requestCtx, cfg.NodeID)
			if err == nil {
				log.Printf("Heartbeat successful: %s", cfg.NodeID)
			}
			return err
		},
	)

	if errors.Is(err, context.Canceled) {
		return err
	}
	return err
}
