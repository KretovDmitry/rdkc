package sheets

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/KretovDmitry/rdkc/internal/config"
	"github.com/KretovDmitry/rdkc/internal/logger"
	"github.com/KretovDmitry/rdkc/internal/sheets/client"
	"github.com/KretovDmitry/rdkc/internal/sheets/models"
	"go.uber.org/zap"
	"golang.org/x/sync/errgroup"
	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

type app struct {
	sheets *sheets.Service
	logger *zap.Logger
}

func New(ctx context.Context) (*app, error) {
	client, err := client.Get(ctx)
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve http client: %w", err)
	}

	srv, err := sheets.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve Sheets client: %w", err)
	}

	return &app{sheets: srv, logger: logger.Get()}, nil
}

func (app *app) GetSchedule(ctx context.Context) (models.Shifts, error) {
	// eg, ctx := errgroup.WithContext(ctx)

	specColumns, err := app.MapColumnsBySpecialty(ctx)
	if err != nil {
		return nil, fmt.Errorf("unable to map columns by specialty: %w", err)
	}

	// fmt.Println(specColumns)
	// firstDayOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local)

	allShifts, err := app.getShifts(ctx, specColumns)
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve shifts: %w", err)
	}

	// schedule := make(map[time.Time]models.Shift, daysInMonth*len(cols))
	return allShifts, nil
}

func (app *app) getValues(ctx context.Context, readRange string) (*sheets.ValueRange, error) {
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	default:
	}

	resp, err := app.sheets.Spreadsheets.Values.Get(config.SpreadsheetId, readRange).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve data from sheet: %w", err)
	}

	return resp, nil
}

func (app *app) MapColumnsBySpecialty(ctx context.Context) (map[models.Specialty]models.Column, error) {
	start := time.Now()

	// first row contains specialties
	readRange := fmt.Sprintf("%s!1:1", start.Month())
	resp, err := app.getValues(ctx, readRange)
	if err != nil {
		return nil, err
	}

	specColumns := make(map[models.Specialty]models.Column, len(resp.Values))
	for i, col := range resp.Values[0] {
		if c, ok := col.(string); ok {
			c = strings.TrimSpace(strings.ToLower(c))
			t := convertToTitle(i + 1)
			specColumns[models.Specialty(c)] = models.Column(t)
		}
	}

	app.logger.Info(
		"specialties collected",
		zap.Int("quantity", len(specColumns)),
		zap.Duration("duration", time.Since(start)),
	)

	return specColumns, nil
}

func (app *app) getShifts(ctx context.Context, cols map[models.Specialty]models.Column) (models.Shifts, error) {
	start := time.Now()
	eg, ctx := errgroup.WithContext(ctx)
	daysInMonth := daysInMonth(time.Now())

	// at least one specialist works in a day
	allShifts := make(models.Shifts, 0, daysInMonth*len(cols))
	resultChan := make(chan models.Shifts, len(cols))

	// read all results into an array
	eg.Go(func() error {
		returned := 0
		for {
			select {
			case <-ctx.Done():
				// Always check to see if the context has cancelled,
				// if there is an error errgroup will cancel the
				// context and all goroutines will need to exit
				// before `eg.Wait` returns.
				return context.Canceled
			case shifts := <-resultChan:
				allShifts = append(allShifts, shifts...)
				returned++
				if returned == len(cols) {
					return nil
				}
			}
		}
	})

	// run all the http requests in parallel
	for spec, col := range cols {
		spec, col := spec, col
		eg.Go(func() error {
			return app.getColShifts(ctx, spec, col, resultChan)
		})
	}

	app.logger.Info(
		"got all shifts",
		zap.Duration("duration", time.Since(start)),
	)

	// wait for completion and return the first error (if any)
	return allShifts, eg.Wait()
}

func (app *app) getColShifts(
	ctx context.Context, spec models.Specialty, col models.Column, out chan<- models.Shifts,
) error {
	now := time.Now()
	firstDayOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local)
	daysInMonth := daysInMonth(now)

	// read from the second row; first contains the specialty name
	readRange := fmt.Sprintf(
		"%s!%[2]s2:%[2]s",
		now.Month(),
		col,
	)

	resp, err := app.getValues(ctx, readRange)
	if err != nil {
		return fmt.Errorf("get values: %w", err)
	}

	// due to merged cells we have to omit empty rows
	var i, cnt int
	for _, cell := range resp.Values {
		if len(cell) > 0 {
			resp.Values[i] = cell
			i++
			cnt++
		}
	}
	resp.Values = resp.Values[:cnt]

	// do not process unfilled column
	if len(resp.Values) < 2*daysInMonth || len(resp.Values)%2 == 1 {
		if col != "A" {
			app.logger.Error(
				"unfilled specialty column",
				zap.Any("col", col),
				zap.Int("filled", len(resp.Values)),
				zap.Int("expected", 2*daysInMonth),
			)
		}
		out <- nil
		return nil
	}

	// fmt.Println(resp.Values)

	shifts := make(models.Shifts, 0, len(resp.Values)/2)

	// parse each row
	// general schema of a schedule column:
	// N row: working time in format "start[hh:mm]-end[hh:mm]"
	// N+1 row: specialist in format "LastName FirstName MiddleName"
	day := 0
	for i := 0; i < len(resp.Values); i += 2 {
		specialist, ok := resp.Values[i+1][0].(string)
		if !ok {
			return fmt.Errorf(
				"unable to assert C[%s]R[%d] to string", col, i+1,
			)
		}

		t, ok := resp.Values[i][0].(string)
		if !ok {
			return fmt.Errorf(
				"unable to assert C[%s]R[%d] to string", col, i+1,
			)
		}

		startEnd := strings.Split(t, "-")

		start, err := time.Parse("15:04", startEnd[0])
		if err != nil {
			return fmt.Errorf(
				"unable to parse start time at C[%s]R[%d]: %w", col, i+2, err,
			)
		}

		end, err := time.Parse("15:04", startEnd[1])
		if err != nil {
			return fmt.Errorf(
				"unable to parse end time at C[%s]R[%d]: %w", col, i+2, err,
			)
		}

		switch {
		// day shifts
		case start.Hour() < end.Hour():
			days := time.Duration(day) * 24 * time.Hour
			date := firstDayOfMonth.Add(days)
			// start and end today
			start = date.Add(time.Hour * time.Duration(start.Hour())).In(time.UTC)
			end = date.Add(time.Hour*time.Duration(end.Hour()) - time.Second).In(time.UTC)
			// do not increment day because the next shift will start today

		// night shifts
		case start.Hour() > end.Hour():
			days := time.Duration(day) * 24 * time.Hour
			date := firstDayOfMonth.Add(days)
			// start today
			start = date.Add(time.Hour * time.Duration(start.Hour())).In(time.UTC)
			day++
			days = time.Duration(day) * 24 * time.Hour
			date = firstDayOfMonth.Add(days)
			// end tomorrow
			end = date.Add(time.Hour*time.Duration(end.Hour()) - time.Second).In(time.UTC)

		// 24 hours shifts
		default:
			days := time.Duration(day) * 24 * time.Hour
			date := firstDayOfMonth.Add(days)
			day++
			start = date.Add(time.Hour * time.Duration(start.Hour())).In(time.UTC)
			end = date.AddDate(0, 0, 1).Add(time.Hour*time.Duration(end.Hour()) - time.Second).In(time.UTC)
		}

		// fmt.Println(start, end, s)

		shifts = append(shifts, &models.Shift{
			Staff: models.Staff{
				FullName:  specialist,
				Specialty: spec,
			},
			Start: start,
			End:   end},
		)
	}

	select {
	case <-ctx.Done():
		return context.Canceled
	default:
		out <- shifts
		return nil
	}
}

func (app *app) GetContacts(ctx context.Context) (map[models.Specialty]map[string]*models.Staff, error) {
	specialties, err := app.getValues(ctx, "Contacts!A:A")
	if err != nil {
		return nil, fmt.Errorf("get values: %w", err)
	}

	names, err := app.getValues(ctx, "Contacts!B:B")
	if err != nil {
		return nil, fmt.Errorf("get values: %w", err)
	}

	phones, err := app.getValues(ctx, "Contacts!C:C")
	if err != nil {
		return nil, fmt.Errorf("get values: %w", err)
	}

	emails, err := app.getValues(ctx, "Contacts!D:D")
	if err != nil {
		return nil, fmt.Errorf("get values: %w", err)
	}

	n := min(
		len(specialties.Values),
		len(names.Values),
		len(phones.Values),
		len(emails.Values),
	)

	contacts := make(map[models.Specialty]map[string]*models.Staff, 25)

	for i := 0; i < n; i++ {
		var (
			specialty string
			name      string
			phone     string
			email     string
			ok        bool
		)

		if len(names.Values[i]) == 0 &&
			len(phones.Values[i]) == 0 &&
			len(emails.Values[i]) == 0 {
			continue
		}

		if len(specialties.Values[i]) > 0 {
			specialty, ok = specialties.Values[i][0].(string)
			if !ok {
				return nil, fmt.Errorf(
					"unable to assert C[A]R[%d] to string", i+1,
				)
			}
		}
		spec := models.Specialty(specialty)

		if len(names.Values[i]) > 0 {
			name, ok = names.Values[i][0].(string)
			if !ok {
				return nil, fmt.Errorf(
					"unable to assert C[B]R[%d] to string", i+1,
				)
			}
		}

		if len(phones.Values[i]) > 0 {
			phone, ok = phones.Values[i][0].(string)
			if !ok {
				return nil, fmt.Errorf(
					"unable to assert C[C]R[%d] to string", i+1,
				)
			}
		}

		if len(emails.Values[i]) > 0 {
			email, ok = emails.Values[i][0].(string)
			if !ok {
				return nil, fmt.Errorf(
					"unable to assert C[D]R[%d] to string", i+1,
				)
			}
		}

		var forChildren bool
		if strings.HasPrefix(specialty, "детский") {
			forChildren = true
		}

		if contacts[spec] == nil {
			contacts[spec] = make(map[string]*models.Staff, 15)
		}

		contacts[spec][name] = &models.Staff{
			ID:          i + 1,
			FullName:    name,
			Phone:       phone,
			Email:       email,
			Specialty:   spec,
			ForChildren: forChildren,
		}

		// fmt.Println(
		// 	i,
		// 	specialties.Values[i],
		// 	names.Values[i],
		// 	phones.Values[i],
		// 	emails.Values[i],
		// )
	}

	return contacts, nil
}

// convertToTitle converts a column number to its corresponding
// column title as it appears in an Excel sheet.
func convertToTitle(columnNumber int) string {
	chars := make([]byte, 0)
	for columnNumber > 0 {
		columnNumber--
		chars = append(chars, byte('A'+columnNumber%26))
		columnNumber /= 26
	}

	// reverse order
	for l, r := 0, len(chars)-1; l < r; l, r = l+1, r-1 {
		chars[l], chars[r] = chars[r], chars[l]
	}

	return string(chars)
}

// daysInMonth returns the number of days in the month specified by t.
func daysInMonth(t time.Time) int {
	y, m, _ := t.Date()
	return time.Date(y, m+1, 0, 0, 0, 0, 0, time.UTC).Day()
}
