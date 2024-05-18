package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"

	"github.com/KretovDmitry/rdkc/internal/application/services/emias"
	"github.com/KretovDmitry/rdkc/internal/config"
	"github.com/KretovDmitry/rdkc/pkg/logger"
	_ "github.com/jackc/pgx/v5/stdlib"
	sqldblogger "github.com/simukti/sqldb-logger"
)

// Version indicates the current version of the application.
var Version = "1.0.0"

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	// Server run context
	serverCtx, serverStopCtx := context.WithCancel(context.Background())
	defer serverStopCtx()

	// Load application configurations.
	cfg := config.MustLoad()

	// Create root logger tagged with server version.
	logger := logger.New(cfg).With(serverCtx, "version", Version)

	// Connect to postgres.
	db, err := sql.Open("pgx", cfg.DSN)
	if err != nil {
		return fmt.Errorf("failed to open the database: %w", err)
	}

	// Log every query to the database.
	db = sqldblogger.OpenDriver(cfg.DSN, db.Driver(), logger)

	// Check connectivity and DSN correctness.
	if err = db.Ping(); err != nil {
		return fmt.Errorf("failed to connect to the database: %w", err)
	}

	// Close connection.
	defer func() {
		if err = db.Close(); err != nil {
			logger.Error(err)
		}
		_ = logger.Sync()
	}()

	emias, err := emias.New(cfg, logger)
	if err != nil {
		return fmt.Errorf("new emias client: %w", err)
	}

	if err = emias.Synchronize(serverCtx); err != nil {
		return fmt.Errorf("emias: %w", err)
	}

	return nil
}
