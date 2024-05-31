package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/KretovDmitry/rdkc/internal/application/errs"
	"github.com/KretovDmitry/rdkc/internal/application/repositories"
	"github.com/KretovDmitry/rdkc/internal/domain/entities"
	"github.com/KretovDmitry/rdkc/pkg/logger"
)

type ScheduleRepository struct {
	db     *sql.DB
	logger logger.Logger
}

var _ repositories.ScheduleRepository = (*ScheduleRepository)(nil)

func NewScheduleRepository(
	db *sql.DB,
	logger logger.Logger,
) (*ScheduleRepository, error) {
	if db == nil {
		return nil, fmt.Errorf("%w: *sql.DB", errs.ErrNilDependency)
	}
	if logger == nil {
		return nil, fmt.Errorf("%w: logger", errs.ErrNilDependency)
	}

	return &ScheduleRepository{
		db:     db,
		logger: logger,
	}, nil
}

func (sr *ScheduleRepository) Update(ctx context.Context, shifts entities.Shifts) error {
	const q = `
		WITH upsert AS 
		(
			UPDATE 
				schedules AS sch
			SET
				staff_id = $1,
				updated_at = CURRENT_TIMESTAMP
			FROM
				staff AS st
			WHERE
				sch.staff_id = st.id
			AND
				st.specialty = $2
			AND
				start = $3
			AND
				"end" = $4
			RETURNING
				staff_id
		) 
		INSERT INTO schedules
		(
			start,
			"end",
			staff_id,
			created_at,
			updated_at
		) 
		SELECT
			$3,
			$4,
			$1,
			CURRENT_TIMESTAMP,
			CURRENT_TIMESTAMP
		WHERE NOT EXISTS (SELECT 1 FROM upsert);
	`

	tx, err := sr.db.BeginTx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
	})
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer func() {
		err = tx.Rollback()
		if err != nil && !errors.Is(err, sql.ErrTxDone) {
			sr.logger.Errorf("rollback error: %s", err)
		}
	}()

	stmt, err := tx.PrepareContext(ctx, q)
	if err != nil {
		return fmt.Errorf("prepare statement: %w", err)
	}
	defer stmt.Close()

	for _, s := range shifts {
		_, err = stmt.ExecContext(
			ctx,
			s.Employee.ID,
			s.Employee.Specialty,
			s.Start,
			s.End,
		)
		if err != nil {
			return fmt.Errorf("exec context: %w", err)
		}
	}

	return tx.Commit()
}
