package sheets

import (
	"context"
	"fmt"
	"rdkc/internal/config"
	"rdkc/internal/logger"
	"rdkc/internal/sheets/client"
	"rdkc/internal/sheets/models"
	"strings"
	"time"

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

func (app *app) GetValues(readRange string) (*sheets.ValueRange, error) {
	resp, err := app.sheets.Spreadsheets.Values.Get(config.SpreadsheetId, readRange).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve data from sheet: %w", err)
	}

	return resp, nil
}

func (app *app) MapColumnsBySpecialty(readRange string) (map[models.Specialty]models.Column, error) {
	start := time.Now()

	resp, err := app.GetValues(readRange)
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
		"mapped columns by specialty",
		zap.Int("specialty columns", len(specColumns)),
		zap.Duration("duration", time.Since(start)),
	)

	return specColumns, nil
}
func (app *app) GetShifts(ctx context.Context) (models.Shifts, error) {
	eg, ctx := errgroup.WithContext(ctx)

	// first row contains specialties
	specialtiesRow := fmt.Sprintf("%s!1:1", time.Now().Month())
	specColumns, err := app.MapColumnsBySpecialty(specialtiesRow)
	if err != nil {
		return nil, fmt.Errorf("unable to map columns by specialty: %w", err)
	}

	// fmt.Println(specColumns)

	now := time.Now()
	firstDayOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local)
	daysInMonth := daysInMonth(now)

	// at least one specialist works in a day
	allShifts := make(models.Shifts, 0, daysInMonth*len(specColumns))
	resultChan := make(chan models.Shifts, len(specColumns))

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
				if returned == len(specColumns) {
					return nil
				}
			}
		}
	})

	// run all the http requests in parallel
	for _, col := range specColumns {
		col := col

		// read from the second row; first contains the specialty name
		readRange := fmt.Sprintf(
			"%s!%[2]s2:%[2]s",
			now.Month(),
			col,
		)

		eg.Go(func() error {
			// request rows
			resp, err := app.GetValues(readRange)
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
				resultChan <- nil
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
				s, ok := resp.Values[i+1][0].(string)
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

				shifts = append(shifts, &models.Shift{StaffId: s, Start: start, End: end})
			}

			select {
			case <-ctx.Done():
				return context.Canceled
			default:
				resultChan <- shifts
				return nil
			}
		})
	}

	defer func(start time.Time) {
		app.logger.Info(
			"got all shifts",
			zap.Duration("duration", time.Since(now)),
		)
	}(time.Now())

	// wait for completion and return the first error (if any)
	return allShifts, eg.Wait()
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
