package app

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

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
		return nil, errors.New("db is nil")
	}

	sheets, err := sheets.New(ctx)
	if err != nil {
		return nil, fmt.Errorf("unable to init sheets service: %w", err)
	}

	instance := &App{
		db:     db,
		sheets: sheets,
		logger: logger.Get(),
	}

	if err = instance.UpdateSchedule(ctx); err != nil {
		return nil, fmt.Errorf("update schedule failed: %w", err)
	}

	return instance, nil
}
