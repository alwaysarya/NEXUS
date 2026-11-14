package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/alwaysarya/nexus/services/control-plane/internal/api"
	"github.com/alwaysarya/nexus/services/control-plane/internal/scheduler"
	"github.com/alwaysarya/nexus/services/control-plane/internal/storage"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://atlas:atlas@localhost:5432/nexus?sslmode=disable"
	}

	db, err := sql.Open("pgx", dbURL)
	if err != nil {
		log.Fatalf("Error opening DB: %v", err)
	}
	defer db.Close()

	nodeRepo := storage.NewPostgresNodeRepository(db)
	workloadRepo := storage.NewPostgresWorkloadRepository(db)
	userRepo := storage.NewPostgresUserRepository(db)
	sched := scheduler.NewScheduler(nodeRepo, workloadRepo)

	nodeHandlers := api.NewHandlers(nodeRepo)
	workloadHandlers := api.NewWorkloadHandler(workloadRepo, sched)
	authHandler := api.NewAuthHandler(userRepo)
	healthHandler := api.NewHealthHandler(db)
	metricsHandler := api.NewMetricsHandler()
	agentHandler := api.NewAgentHandler()
	systemHandler := api.NewSystemHandler()
	apikeyHandler := api.NewAPIKeyHandler(db)

	mux := http.NewServeMux()
	api.RegisterRoutes(mux, nodeHandlers, workloadHandlers, authHandler, healthHandler, metricsHandler, agentHandler, systemHandler, apikeyHandler)

	port := ":8080"
	fmt.Printf("Atlas Control Plane running on %s\n", port)
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
