package app

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/KretovDmitry/rdkc/internal/models"
	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5/pgconn"
	"go.uber.org/zap"
)

func (app *App) GetSchedule(ctx context.Context) (models.Schedule, error) {
	sheetsStaff, err := app.sheets.GetContacts(ctx)
	if err != nil {
		return nil, fmt.Errorf("unable to get contacts: %w", err)
	}

	DBStaff, err := app.GetStaff(ctx)
	if err != nil {
		return nil, fmt.Errorf("unable to get staff: %w", err)
	}

	newStaff := make([]*models.Staff, 0)

	for sheetsSpecialty, sheetsSpecs := range sheetsStaff {
		if len(DBStaff[sheetsSpecialty]) == 0 {
			newStaff = append(newStaff, sheetsSpecs...)
			continue
		}
		for _, sheetsSpec := range sheetsSpecs {
			var found bool
			for _, DBSpec := range DBStaff[sheetsSpecialty] {
				// The only unique constraint of the staff table.
				// Except of course id and unused emias login field.
				// Persons with unfilled phone field from sheets are skipped.
				// So the new employee will only be added to the DB,
				// when he gets phone filled in the spreadsheet.
				if sheetsSpec.Phone == DBSpec.Phone {
					found = true
					break
				}
			}
			if !found {
				sheetsSpec.EmiasSpecialty = DBStaff[sheetsSpecialty][0].EmiasSpecialty
				newStaff = append(newStaff, sheetsSpec)
			}
		}
	}

	for _, staff := range newStaff {
		fmt.Printf("%#v\n", *staff)
	}

	return nil, nil
}

func (app *App) InsertStaff(ctx context.Context, new []*models.Staff) error {
	start := time.Now()

	const q = `
		INSERT INTO staff
			(
				specialty,
				emias_specialty,
				last_name,
				first_name,
				middle_name,
				email,
				cell_phone_number,
				for_adults
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	tx, err := app.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback()

	stmt, err := tx.PrepareContext(ctx, q)
	if err != nil {
		return fmt.Errorf("prepare statement: %w", err)
	}

	for _, s := range new {
		_, err := stmt.ExecContext(ctx,
			s.Specialty,
			s.EmiasSpecialty,
			s.LastName,
			s.FirstName,
			s.MiddleName,
			s.Email,
			s.Phone,
			s.ForAdults,
		)
		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) {
				if pgErr.Code == pgerrcode.UniqueViolation {
					return fmt.Errorf("duplicate employee: %w", err)
				}
				// create a new error with additional context
				return fmt.Errorf("save url with query (%s): %w",
					formatQuery(q), formatPgError(pgErr),
				)
			}

			return fmt.Errorf("save url with query (%s): %w", formatQuery(q), err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit transaction: %w", err)
	}

	app.logger.Info(
		"inserted staff",
		zap.Duration("duration", time.Since(start)),
	)

	return nil

}
func (app *App) GetStaff(ctx context.Context) (map[models.Specialty][]*models.Staff, error) {
	start := time.Now()

	const q = `
		SELECT
			id,
			specialty,
			emias_specialty,
			last_name,
			first_name,
			middle_name,
			email,
			cell_phone_number,
			for_adults
		FROM 
			staff;
	`

	rows, err := app.db.QueryContext(ctx, q)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			// Create a new error with additional context.
			return nil, fmt.Errorf("retrieve staff with query (%s): %w",
				formatQuery(q), formatPgError(pgErr),
			)
		}

		return nil, fmt.Errorf("retrieve staff with query (%s): %w", formatQuery(q), err)
	}

	all := make(map[models.Specialty][]*models.Staff, 25)

	// nullable values
	var (
		specialty       sql.NullString
		emiasSpecialty  sql.NullString
		firstName       sql.NullString
		middleName      sql.NullString
		email           sql.NullString
		cellPhoneNumber sql.NullString
	)

	for rows.Next() {
		s := new(models.Staff)
		err := rows.Scan(
			&s.ID,
			&specialty,
			&emiasSpecialty,
			&s.LastName,
			&firstName,
			&middleName,
			&email,
			&cellPhoneNumber,
			&s.ForAdults,
		)
		if err != nil {
			return nil, fmt.Errorf("retrieve staff with query (%s): %w", formatQuery(q), err)
		}
		if specialty.Valid {
			s.Specialty = models.Specialty(specialty.String)
		}
		if emiasSpecialty.Valid {
			s.EmiasSpecialty = emiasSpecialty.String
		}
		if firstName.Valid {
			s.FirstName = firstName.String
		}
		if middleName.Valid {
			s.MiddleName = middleName.String
		}
		if email.Valid {
			s.Email = email.String
		}
		if cellPhoneNumber.Valid {
			s.Phone = cellPhoneNumber.String
		}

		lowerSpec := models.Specialty(strings.ToLower(specialty.String))

		if all[lowerSpec] == nil {
			all[lowerSpec] = make([]*models.Staff, 0, 20)
		}

		all[lowerSpec] = append(all[lowerSpec], s)
	}

	if err = rows.Close(); err != nil {
		return nil, fmt.Errorf("close rows with query (%s): %w", formatQuery(q), err)
	}

	// Rows.Err will report the last error encountered by Rows.Scan.
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("retrieve staff with query (%s): %w", formatQuery(q), err)
	}

	if len(all) == 0 {
		return nil, models.ErrNotFound
	}

	app.logger.Info(
		"got all staff from db",
		zap.Duration("duration", time.Since(start)),
	)

	return all, nil
}
