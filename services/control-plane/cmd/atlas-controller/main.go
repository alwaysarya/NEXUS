package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/alwaysarya/nexus/services/control-plane/internal/api"
	"github.com/alwaysarya/nexus/services/control-plane/internal/config"
	"github.com/alwaysarya/nexus/services/control-plane/internal/scheduler"
	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
)

func main() {
	port := os.Getenv("NEXUS_CONTROL_PLANE_PORT")
	if port == "" {
		port = "8080"
	}

	ctx, stop := signal.NotifyContext(
		context.Background(),
		os.Interrupt,
		syscall.SIGTERM,
	)
	defer stop()

	dbConfig, err := config.LoadPostgresConfig()
	if err != nil {
		log.Fatalf("failed to load PostgreSQL configuration: %v", err)
	}

	db, err := storage.NewPostgres(ctx, dbConfig)
	if err != nil {
		log.Fatalf("failed to connect to PostgreSQL: %v", err)
	}
	defer db.Close()

	log.Println("NEXUS PostgreSQL connection established")

	repository := storage.NewPostgresNodeRepository(db)
	nodeAPI := api.NewNodeAPI(repository)

	mux := http.NewServeMux()
	api.RegisterRoutes(mux, nodeAPI)
	workloadScheduler := scheduler.New(repository, repository)
	workloadRepository := storage.NewPostgresWorkloadRepository(db)
	api.RegisterWorkloadRoutes(mux, workloadScheduler, workloadRepository)

	monitorDone := make(chan struct{})
	go func() {
		defer close(monitorDone)
		nodeAPI.StartMonitor(ctx, 5*time.Second, 30*time.Second)
	}()

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}

	serverErrors := make(chan error, 1)

	go func() {
		log.Printf("NEXUS Control Plane starting on port %s", port)
		serverErrors <- server.ListenAndServe()
	}()

	select {
	case err := <-serverErrors:
		if !errors.Is(err, http.ErrServerClosed) {
			log.Printf("Control Plane server failed: %v", err)
			stop()
		}

	case <-ctx.Done():
		log.Println("NEXUS Control Plane shutting down")
	}

	shutdownCtx, cancel := context.WithTimeout(
		context.Background(),
		10*time.Second,
	)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		log.Printf("Graceful shutdown failed: %v", err)
		_ = server.Close()
	}

	<-monitorDone

	log.Println("NEXUS Control Plane stopped")
}
