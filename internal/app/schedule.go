package app

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/KretovDmitry/rdkc/internal/models"
	"github.com/jackc/pgx/v5/pgconn"
	"go.uber.org/zap"
)

func (app *App) UpdateSchedule(ctx context.Context) error {
	shifts, err := app.getSchedule(ctx)
	if err != nil {
		return fmt.Errorf("get schedule failed: %w", err)
	}

	if err := app.insertSchedule(ctx, shifts); err != nil {
		return fmt.Errorf("insert schedule failed: %w", err)
	}

	return nil
}

// пetSchedule retrieves the schedule from the Google Sheets and the database.
// It returns a list of shifts and any errors encountered.
func (app *App) getSchedule(ctx context.Context) (models.Shifts, error) {
	// Get the staff from the Google Sheets.
	sheetsStaff, err := app.sheets.GetContacts(ctx)
	if err != nil {
		return nil, fmt.Errorf("unable to get contacts: %w", err)
	}

	// Get the staff from the database.
	DBStaff, err := app.getStaff(ctx)
	if err != nil {
		return nil, fmt.Errorf("unable to get staff: %w", err)
	}

	// Create a list to hold the new staff members.
	newStaff := make([]*models.Staff, 0)

	// Loop through the specialties in the Google Sheets.
	for sheetsSpecialty, sheetsSpecs := range sheetsStaff {
		// Do not add new specialty if it's not present in DB.
		// Google Sheets contains many trash records.
		if len(DBStaff[sheetsSpecialty]) == 0 {
			app.logger.Info("absent specialty",
				zap.String("spec", string(sheetsSpecialty)))
			continue
		}
		for _, sheetsSpec := range sheetsSpecs {
			// The only unique constraint of the staff table is phone column.
			// Except of course id and unused emias login field.
			// Persons with unfilled phone field from sheets are skipped.
			// So the new employee will only be added to the DB,
			// when he gets phone filled in the spreadsheet.
			if sheetsSpec.Phone == "" {
				continue
			}
			var found bool
			for _, DBSpec := range DBStaff[sheetsSpecialty] {
				if sheetsSpec.Phone == DBSpec.Phone {
					found = true
					break
				}
			}
			// Emias specialty (the same but in other form) is not
			// present in the sheets, but is unique for each specialty.
			if !found {
				sheetsSpec.EmiasSpecialty = DBStaff[sheetsSpecialty][0].EmiasSpecialty
				newStaff = append(newStaff, sheetsSpec)
			}
		}
	}

	if len(newStaff) != 0 {
		// Insert the new staff members into the database.
		if err := app.insertStaff(ctx, newStaff); err != nil {
			return nil, fmt.Errorf("unable to insert staff: %w", err)
		}

		// Get the updated staff list from the database.
		DBStaff, err = app.getStaff(ctx)
		if err != nil {
			return nil, fmt.Errorf("unable to get staff: %w", err)
		}
	}

	// Get the schedule from the Google Sheets.
	shifts, err := app.sheets.GetSchedule(ctx)
	if err != nil {
		return nil, fmt.Errorf("unable to get schedule: %w", err)
	}

	// Loop over shifts to populate employee with actual
	// information from database.
	for _, shift := range shifts {
		// Return error if any specialty doesn't exists in DB.
		if DBStaff[shift.Staff.Specialty] == nil {
			return nil, fmt.Errorf(
				"no such specialty in staff table: %s",
				shift.Staff.Specialty,
			)
		}
		// Substitute uncompleted sheets employee record with
		// actual one from database.
		for _, spec := range DBStaff[shift.Staff.Specialty] {
			if spec.FirstName == shift.Staff.FirstName &&
				spec.LastName == shift.Staff.LastName &&
				spec.MiddleName == shift.Staff.MiddleName {
				shift.Staff = spec
				break
			}
		}
	}

	// Debug print.
	// for _, shift := range shifts {
	// 	fmt.Printf(
	// 		"ID: %d\tSPEC: %s\tFN: %s\tLN: %s\t MN:%s\tSTART: %s\tEND: %s\tADULTS: %t\n",
	// 		shift.Staff.ID,
	// 		shift.Staff.Specialty,
	// 		shift.Staff.FirstName,
	// 		shift.Staff.LastName,
	// 		shift.Staff.MiddleName,
	// 		shift.Start.String(),
	// 		shift.End.String(),
	// 		shift.Staff.ForAdults,
	// 	)
	// }

	return shifts, nil
}

func (app *App) insertStaff(ctx context.Context, new []*models.Staff) error {
	start := time.Now()
	var values []string
	var args []any
	for i, n := range new {
		base := i * 8
		params := fmt.Sprintf(
			"($%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d)",
			base+1, base+2, base+3, base+4,
			base+5, base+6, base+7, base+8,
		)
		values = append(values, params)
		args = append(args,
			string(n.Specialty),
			n.EmiasSpecialty,
			n.LastName,
			n.FirstName,
			n.MiddleName,
			n.Email,
			n.Phone,
			n.ForAdults,
		)
	}

	q := `
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
		VALUES ` + strings.Join(values, ",") + `;`

	_, err := app.db.ExecContext(ctx, q, args...)

	app.logger.Info(
		"inserted staff",
		zap.Int("num", len(new)),
		zap.Duration("duration", time.Since(start)),
	)

	return err
}

// getStaff retrieves all staff from the database.
func (app *App) getStaff(ctx context.Context) (map[models.Specialty][]*models.Staff, error) {
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
			return nil, fmt.Errorf("retrieve staff with query (%s): %w",
				formatQuery(q), formatPgError(pgErr),
			)
		}
		return nil, fmt.Errorf("retrieve staff with query (%s): %w",
			formatQuery(q), err)
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
			return nil, fmt.Errorf("retrieve staff with query (%s): %w",
				formatQuery(q), err)
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
		return nil, fmt.Errorf("close rows with query (%s): %w",
			formatQuery(q), err)
	}

	// Rows.Err will report the last error encountered by Rows.Scan.
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("retrieve staff with query (%s): %w",
			formatQuery(q), err)
	}

	if len(all) == 0 {
		return nil, models.ErrNotFound
	}

	app.logger.Info(
		"got all staff from db",
		zap.Int("specialties", len(all)),
		zap.Duration("duration", time.Since(start)),
	)

	return all, nil
}

func (app *App) insertSchedule(ctx context.Context, shifts models.Shifts) error {
	start := time.Now()

	row := app.db.QueryRowContext(ctx, "SELECT COUNT(*) FROM schedules;")

	var numberOfOldShifts int
	row.Scan(&numberOfOldShifts)
	if err := row.Err(); err != nil {
		return fmt.Errorf("failed to count rows in schedules: %w", err)
	}

	if numberOfOldShifts == len(shifts) {
		app.logger.Info(
			"number of rows in schedules is the same as in the shifts",
			zap.Int("rows", len(shifts)),
			zap.Duration("duration", time.Since(start)),
		)
		return nil
	}

	_, err := app.db.ExecContext(ctx, `TRUNCATE TABLE schedules;`)
	if err != nil {
		return fmt.Errorf("failed to truncate schedules: %w", err)
	}

	var values []string
	var args []any
	for i, s := range shifts {
		base := i * 3
		params := fmt.Sprintf("($%d, $%d, $%d)", base+1, base+2, base+3)
		values = append(values, params)
		args = append(args, s.Start, s.End, s.Staff.ID)
	}

	q := `
		INSERT INTO schedules
			(
				start,
				"end",
				staff_id
			)
		VALUES ` + strings.Join(values, ",") + `;`

	_, err = app.db.ExecContext(ctx, q, args...)

	app.logger.Info(
		"inserted all shifts into schedules",
		zap.Int("rows", len(shifts)),
		zap.Duration("duration", time.Since(start)),
	)

	return err
}
