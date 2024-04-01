package app

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/KretovDmitry/rdkc/internal/logger"
	"github.com/KretovDmitry/rdkc/internal/sheets"
	"go.uber.org/zap"
)

type App struct {
	db     *sql.DB
	sheets *sheets.App
	logger *zap.Logger
}

func New(ctx context.Context, db *sql.DB) (*App, error) {
	if db == nil {
		return nil, fmt.Errorf("db is nil")
	}

	sheets, err := sheets.New(ctx)
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve Sheets client: %w", err)
	}

	instance := &App{
		db:     db,
		sheets: sheets,
		logger: logger.Get(),
	}

	if err := instance.UpdateSchedule(ctx); err != nil {
		return nil, fmt.Errorf("update schedule failed: %w", err)
	}

	return instance, nil
}
