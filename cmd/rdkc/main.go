package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/KretovDmitry/rdkc/internal/application/services/schedule"
	"github.com/KretovDmitry/rdkc/internal/application/services/sheets"
	"github.com/KretovDmitry/rdkc/internal/config"
	"github.com/KretovDmitry/rdkc/internal/infrastructure/db/postgres"
	"github.com/KretovDmitry/rdkc/pkg/logger"
	trmsql "github.com/avito-tech/go-transaction-manager/drivers/sql/v2"
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

	// Create default transaction manager for database/sql package.
	//	trManager := manager.Must(
	//		trmsql.NewDefaultFactory(db),
	//		manager.WithCtxManager(trmcontext.DefaultManager),
	//	)

	// Init repositories.
	staffRepo, err := postgres.NewStaffRepository(db, trmsql.DefaultCtxGetter, logger)
	if err != nil {
		return fmt.Errorf("failed to init staff repository: %w", err)
	}
	scheduleRepo, err := postgres.NewScheduleRepository(db, logger)
	if err != nil {
		return fmt.Errorf("failed to init schedule repository: %w", err)
	}

	//	emias, err := emias.New(cfg, logger)
	//	if err != nil {
	//		return fmt.Errorf("new emias client: %w", err)
	//	}
	//
	//	if err = emias.Synchronize(serverCtx); err != nil {
	//		return fmt.Errorf("emias: %w", err)
	//	}

	sheetsService, err := sheets.NewService(serverCtx, cfg, logger)
	if err != nil {
		return fmt.Errorf("failed to init sheets service: %w", err)
	}

	scheduleService, err := schedule.NewService(staffRepo, scheduleRepo, sheetsService, logger)
	if err != nil {
		return fmt.Errorf("failed to init schedule service: %w", err)
	}

	when := time.Now()
	when = time.Date(when.Year(), when.Month()-1, 1, 0, 0, 0, 0, time.UTC)

	err = scheduleService.UpdateSchedule(serverCtx, when)
	if err != nil {
		return fmt.Errorf("failed to update schedule from google spreadsheet: %w", err)
	}

	return nil
}
