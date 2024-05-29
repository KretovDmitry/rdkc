package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/KretovDmitry/rdkc/internal/application/errs"
	"github.com/KretovDmitry/rdkc/internal/application/repositories"
	"github.com/KretovDmitry/rdkc/internal/domain/entities"
	"github.com/KretovDmitry/rdkc/internal/models"
	"github.com/KretovDmitry/rdkc/pkg/logger"
	trmsql "github.com/avito-tech/go-transaction-manager/drivers/sql/v2"
	"github.com/jackc/pgx/v5/pgconn"
)

type StaffRepository struct {
	db     *sql.DB
	getter *trmsql.CtxGetter
	logger logger.Logger
}

var _ repositories.StaffRepository = (*StaffRepository)(nil)

func NewStaffRepository(
	db *sql.DB,
	getter *trmsql.CtxGetter,
	logger logger.Logger,
) (*StaffRepository, error) {
	if db == nil {
		return nil, fmt.Errorf("%w: *sql.DB", errs.ErrNilDependency)
	}
	if getter == nil {
		return nil, fmt.Errorf("%w: *trmsql.CtxGetter", errs.ErrNilDependency)
	}
	if logger == nil {
		return nil, fmt.Errorf("%w: logger", errs.ErrNilDependency)
	}

	return &StaffRepository{
		db:     db,
		getter: getter,
		logger: logger,
	}, nil
}

func (sr *StaffRepository) GetAll(ctx context.Context) (map[string]entities.Staff, error) {
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

	// Get transaction from context if any.
	rows, err := sr.getter.DefaultTrOrDB(ctx, sr.db).QueryContext(ctx, q)
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

	all := make(map[string]entities.Staff, 25)
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
		s := new(entities.Employee)
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
			return nil, fmt.Errorf("scan staff row with query (%s): %w",
				formatQuery(q), err)
		}
		if specialty.Valid {
			s.Specialty = specialty.String
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

		lowerSpec := strings.ToLower(specialty.String)

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

	sr.logger.Info(
		"got all staff from db (%d specialties) in %v",
		len(all), time.Since(start),
	)

	return all, nil
}

// SaveAll saves all emploeeys into the database.
func (sr *StaffRepository) SaveAll(ctx context.Context, staff entities.Staff) error {
	start := time.Now()
	ln := len(staff)

	placeholders := make([]string, 0, ln)
	args := make([]any, 0, ln)
	for i, n := range staff {
		base := i * 8
		placeholder := fmt.Sprintf(
			"($%d, $%d, $%d, $%d, $%d, $%d, $%d, $%d)",
			base+1, base+2, base+3, base+4,
			base+5, base+6, base+7, base+8,
		)
		placeholders = append(placeholders, placeholder)
		args = append(args,
			n.Specialty,
			n.EmiasSpecialty,
			n.LastName,
			n.FirstName,
			n.MiddleName,
			n.Email,
			n.Phone,
			n.ForAdults,
		)
	}

	// Concatenating ONLY placeholders which are simple integers.
	// Arguments are passed through ExecContext call => no SQL injection.
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
		VALUES ` + strings.Join(placeholders, ",") + `;`

	// Get transaction from context if any.
	_, err := sr.getter.DefaultTrOrDB(ctx, sr.db).ExecContext(ctx, q, args...)
	if err != nil {
		return fmt.Errorf("schedule repository: exec context: %w", err)
	}

	sr.logger.Info("schedule repository: save all %d in %v", ln, time.Since(start))

	return nil
}
