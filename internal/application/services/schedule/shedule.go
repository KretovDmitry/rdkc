package schedule

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/KretovDmitry/rdkc/internal/application/errs"
	"github.com/KretovDmitry/rdkc/internal/application/interfaces"
	"github.com/KretovDmitry/rdkc/internal/application/repositories"
	"github.com/KretovDmitry/rdkc/internal/domain/entities"
	"github.com/KretovDmitry/rdkc/pkg/logger"
	"golang.org/x/sync/errgroup"
)

type Service struct {
	staffRepo    repositories.StaffRepository
	scheduleRepo repositories.ScheduleRepository
	sheets       interfaces.SheetsService
	logger       logger.Logger
}

var _ interfaces.ScheduleService = (*Service)(nil)

func NewService(
	staffRepo repositories.StaffRepository,
	scheduleRepo repositories.ScheduleRepository,
	sheets interfaces.SheetsService,
	logger logger.Logger,
) (*Service, error) {
	if staffRepo == nil {
		return nil, fmt.Errorf("%w: staff repository", errs.ErrNilDependency)
	}
	if scheduleRepo == nil {
		return nil, fmt.Errorf("%w: schedule repository", errs.ErrNilDependency)
	}
	if sheets == nil {
		return nil, fmt.Errorf("%w: sheets service", errs.ErrNilDependency)
	}
	if logger == nil {
		return nil, fmt.Errorf("%w: logger", errs.ErrNilDependency)
	}

	return &Service{
		staffRepo:    staffRepo,
		scheduleRepo: scheduleRepo,
		sheets:       sheets,
		logger:       logger,
	}, nil
}

func (s *Service) UpdateStaff(ctx context.Context) error {
	// Get the staff from the Google Sheets.
	sheetsStaff, err := s.getGoogleSpreadsheetStaff(ctx)
	if err != nil {
		return fmt.Errorf("get google spreadsheet staff: %w", err)
	}

	// Get the staff from the database.
	fromDB, err := s.staffRepo.GetAll(ctx)
	if err != nil {
		return fmt.Errorf("get staff from database: %w", err)
	}

	// Create a slice to hold the new staff members.
	newStaff := s.identifyNewEmployees(fromDB, sheetsStaff)

	if len(newStaff) != 0 {
		// Insert the new staff members into the database.
		if err = s.staffRepo.SaveAll(ctx, newStaff); err != nil {
			return fmt.Errorf("unable to insert staff: %w", err)
		}
	}

	s.logger.Infof("saved new employees: %d", len(newStaff))

	return nil
}

func (s *Service) UpdateSchedule(ctx context.Context, when time.Time) error {
	err := s.UpdateStaff(ctx)
	if err != nil {
		return fmt.Errorf("failed update staff from sheets: %w", err)
	}

	// Get updated staff from the database.
	staffFromDB, err := s.staffRepo.GetAll(ctx)
	if err != nil {
		return fmt.Errorf("get staff from database: %w", err)
	}

	// Get schedule from the Google Sheets.
	shifts, err := s.getScheduleFromSheets(ctx, when)
	if err != nil {
		return fmt.Errorf("failed to get schedule from sheets: %w", err)
	}

	// Loop over shifts to populate employee with the actual
	// information from database.
	for _, shift := range shifts {
		// Return error if any specialty doesn't exists in DB.
		if staffFromDB[shift.Employee.Specialty] == nil {
			return fmt.Errorf(
				"no such specialty in staff table: %s",
				shift.Employee.Specialty,
			)
		}
		// Substitute uncompleted sheets employee record with
		// actual one from the database.
		for _, spec := range staffFromDB[shift.Employee.Specialty] {
			if spec.FirstName == shift.Employee.FirstName &&
				spec.LastName == shift.Employee.LastName &&
				spec.MiddleName == shift.Employee.MiddleName {
				shift.Employee = spec
				break
			}
		}
	}

	if err = s.scheduleRepo.Update(ctx, shifts); err != nil {
		return fmt.Errorf("failed to update staff in the database: %w", err)
	}

	return nil
}

func (s *Service) getScheduleFromSheets(
	ctx context.Context,
	when time.Time,
) (entities.Shifts, error) {
	start := time.Now()

	// Determine which column the specialty belongs to.
	specColumns, err := s.mapSpecialtyToColumn(ctx, when)
	if err != nil {
		return nil, fmt.Errorf("unable to map columns by specialty: %w", err)
	}

	eg, ctx := errgroup.WithContext(ctx)
	daysInMonth := daysInMonth(when)

	// At least one specialist works per day.
	allShifts := make(entities.Shifts, 0, daysInMonth*len(specColumns))
	resultChan := make(chan entities.Shifts, len(specColumns))

	// Read all results into an array.
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

	// Collect all columns in parallel.
	for spec, col := range specColumns {
		spec, col := spec, col
		eg.Go(func() error {
			return s.getColShifts(ctx, spec, col, when, resultChan)
		})
	}

	// Wait for completion and return the first error if any.
	if err = eg.Wait(); err != nil {
		return nil, err
	}

	s.logger.Infof(
		"got all shifts: %d in %vs",
		len(allShifts), time.Since(start).Seconds(),
	)

	return allShifts, nil
}

func (s *Service) getColShifts(
	ctx context.Context,
	spec entities.Specialty,
	col entities.Column,
	when time.Time,
	out chan<- entities.Shifts,
) error {
	const columnWithDates = entities.Column("A")
	shiftDate := shiftMonthDay(when)
	daysInMonth := daysInMonth(when)

	// Read from the second row, first contains the specialty name.
	readRange := fmt.Sprintf(
		"%s!%[2]s2:%[2]s",
		when.Month(),
		col,
	)

	resp, err := s.sheets.GetValuesFromRange(ctx, readRange)
	if err != nil {
		return fmt.Errorf("get values: %w", err)
	}

	// Due to merged cells we have to omit empty rows.
	var i, cnt int
	for _, cell := range resp.Values {
		if len(cell) > 0 {
			resp.Values[i] = cell
			i++
			cnt++
		}
	}
	resp.Values = resp.Values[:cnt]

	// Do not process unfilled column.
	if len(resp.Values) < 2*daysInMonth || len(resp.Values)%2 == 1 {
		if col != columnWithDates {
			s.logger.Errorf(
				"unfilled column [%s] specialty [%s] filled [%d] expected [%d]",
				col, spec, len(resp.Values), 2*daysInMonth,
			)
		}
		out <- nil
		return nil
	}

	// Omit working time row by dividing by 2.
	shifts := make(entities.Shifts, 0, len(resp.Values)/2)

	// Parse each row.
	// General schema of a schedule column:
	// N row: working time in format "start[hh:mm]-end[hh:mm]"
	// N+1 row: specialist in format "LastName FirstName MiddleName"
	var day int
	for i = 0; i < len(resp.Values); i += 2 {
		var (
			start time.Time
			end   time.Time
		)
		workingTime, ok := resp.Values[i][0].(string)
		if !ok {
			return fmt.Errorf(
				"unable to assert C[%s]R[%d] to string", col, i,
			)
		}

		startEnd := strings.Split(workingTime, "-")

		start, err = time.Parse("15:04", startEnd[0])
		if err != nil {
			return fmt.Errorf(
				"unable to parse start time at C[%s]R[%d]: %w", col, i, err,
			)
		}

		end, err = time.Parse("15:04", startEnd[1])
		if err != nil {
			return fmt.Errorf(
				"unable to parse end time at C[%s]R[%d]: %w", col, i, err,
			)
		}

		fullName, ok := resp.Values[i+1][0].(string)
		if !ok {
			return fmt.Errorf(
				"unable to assert C[%s]R[%d] to string", col, i+1,
			)
		}

		switch {
		// Day shifts starts and end up today so we do not increment
		// day because the next shift will start today.
		case start.Hour() < end.Hour():
			start = addHours(shiftDate(day), start.Hour()).In(time.UTC)
			end = addHoursGap(shiftDate(day), end.Hour()).In(time.UTC)

		// 24 hours and night shifts starts today and end up tomorrow.
		default:
			start = addHours(shiftDate(day), start.Hour()).In(time.UTC)
			day++
			end = addHoursGap(shiftDate(day), end.Hour()).In(time.UTC)
		}

		employee := new(entities.Employee)
		employee.Specialty = trimSpecialty(string(spec))
		employee.SetNameFromFullName(fullName)

		shifts = append(shifts, &entities.Shift{
			Employee: employee,
			Start:    start,
			End:      end,
		})
	}

	select {
	case <-ctx.Done():
		return context.Canceled
	default:
		out <- shifts
		return nil
	}
}

func (s *Service) mapSpecialtyToColumn(
	ctx context.Context,
	when time.Time,
) (entities.ColumnBySpecialty, error) {
	start := time.Now()

	// First row contains specialties.
	readRange := fmt.Sprintf("%s!1:1", when.Month())
	resp, err := s.sheets.GetValuesFromRange(ctx, readRange)
	if err != nil {
		return nil, fmt.Errorf("sheets get values: %w", err)
	}

	specColumns := make(entities.ColumnBySpecialty, len(resp.Values))
	for i, col := range resp.Values[0] {
		if c, ok := col.(string); ok {
			if c == "Дата" || c == "Координатор" {
				continue
			}
			c = strings.ToLower(strings.TrimSpace(c))
			specColumns[entities.Specialty(c)] = convertToTitle(i + 1)
		}
	}

	s.logger.Infof(
		"mapped specialties to columns: %d in %vs",
		len(specColumns), time.Since(start).Seconds(),
	)

	return specColumns, nil
}

func (s *Service) getGoogleSpreadsheetStaff(ctx context.Context) (entities.StaffBySpecialty, error) {
	start := time.Now()

	const (
		contactsFormat      = "Contacts!%[1]s:%[1]s"
		specialtyCol        = "A"
		nameCol             = "B"
		phoneCol            = "C"
		emailCol            = "D"
		numberOfSpecialties = 31
	)

	specialties, err := s.sheets.GetValuesFromRange(
		ctx, fmt.Sprintf(contactsFormat, specialtyCol),
	)
	if err != nil {
		return nil, fmt.Errorf("sheets get values: get specialties column: %w", err)
	}

	names, err := s.sheets.GetValuesFromRange(
		ctx, fmt.Sprintf(contactsFormat, nameCol),
	)
	if err != nil {
		return nil, fmt.Errorf("sheets get values: get names column: %w", err)
	}

	phones, err := s.sheets.GetValuesFromRange(
		ctx, fmt.Sprintf(contactsFormat, phoneCol),
	)
	if err != nil {
		return nil, fmt.Errorf("sheets get values: get phones column: %w", err)
	}

	emails, err := s.sheets.GetValuesFromRange(
		ctx, fmt.Sprintf(contactsFormat, emailCol),
	)
	if err != nil {
		return nil, fmt.Errorf("sheets get values: emails column: %w", err)
	}

	// Determine the length of the least populated column.
	n := min(
		len(specialties.Values),
		len(names.Values),
		len(phones.Values),
		len(emails.Values),
	)

	staff := make(entities.StaffBySpecialty, numberOfSpecialties)

	for i := 1; i < n; i++ {
		if len(phones.Values[i]) == 0 || len(names.Values[i]) == 0 &&
			len(phones.Values[i]) == 0 && len(emails.Values[i]) == 0 {
			continue
		}

		var (
			specialty string
			fullName  string
			phone     string
			email     string
			ok        bool
		)

		if len(specialties.Values[i]) > 0 {
			specialty, ok = specialties.Values[i][0].(string)
			if !ok {
				return nil, fmt.Errorf(
					"unable to assert C[%s]R[%d] to string",
					specialtyCol,
					i+1,
				)
			}
		}

		if len(names.Values[i]) > 0 {
			fullName, ok = names.Values[i][0].(string)
			if !ok {
				return nil, fmt.Errorf(
					"unable to assert C[%s]R[%d] to string",
					nameCol,
					i+1,
				)
			}
		}

		if len(phones.Values[i]) > 0 {
			phone, ok = phones.Values[i][0].(string)
			if !ok {
				return nil, fmt.Errorf(
					"unable to assert C[%s]R[%d] to string",
					phoneCol,
					i+1,
				)
			}
		}

		if len(emails.Values[i]) > 0 {
			email, ok = emails.Values[i][0].(string)
			if !ok {
				return nil, fmt.Errorf(
					"unable to assert C[%s]R[%d] to string",
					emailCol,
					i+1,
				)
			}
		}

		// Determine whether the specialist is a pediatric doctor.
		forAdults := true
		if strings.HasPrefix(specialty, "детский") {
			forAdults = false
		}

		// Trim common prefixes which are unused in the database representation.
		spec := trimSpecialty(specialty)

		employee := &entities.Employee{
			ID:        i + 1,
			Phone:     strings.TrimSpace(phone),
			Email:     strings.TrimSpace(email),
			Specialty: spec,
			ForAdults: forAdults,
		}
		employee.SetNameFromFullName(fullName)

		staff[spec] = append(staff[spec], employee)
	}

	s.logger.Infof("got all contacts from sheets (%d specialties) in %vs",
		len(staff), time.Since(start).Seconds(),
	)

	return staff, nil
}

func (s *Service) identifyNewEmployees(fromDB, fromSheets entities.StaffBySpecialty) entities.Staff {
	// Create a slice to hold the new staff members.
	newStaff := make(entities.Staff, 0)

	// Loop through the specialties in the Google Sheets.
	for sheetsSpecialty, sheetsSpecs := range fromSheets {
		// Do not add new specialty if it's not present in DB.
		// Google Sheets contains many trash records.
		if len(fromDB[sheetsSpecialty]) == 0 {
			s.logger.Infof("absent specialty: %s", sheetsSpecialty)
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
			for _, DBSpec := range fromDB[sheetsSpecialty] {
				if sheetsSpec.Phone == DBSpec.Phone {
					found = true
					break
				}
			}
			// Emias specialty (the same but in other form) is not
			// present in the sheets, but is unique for each specialty.
			if !found {
				sheetsSpec.EmiasSpecialty = fromDB[sheetsSpecialty][0].EmiasSpecialty
				newStaff = append(newStaff, sheetsSpec)
			}
		}
	}

	return newStaff
}

// convertToTitle converts a column number to its corresponding
// column title as it appears in an Excel sheet.
func convertToTitle(columnNumber int) entities.Column {
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

	return entities.Column(chars)
}

// daysInMonth returns the number of days in the month specified by t.
func daysInMonth(t time.Time) int {
	y, m, _ := t.Date()
	return time.Date(y, m+1, 0, 0, 0, 0, 0, time.UTC).Day()
}

func trimSpecialty(specialty string) entities.Specialty {
	specialty = strings.TrimSpace(strings.ToLower(specialty))
	// Trim prefix if the specialist is the head of department.
	specialty = strings.TrimPrefix(specialty, "зав")
	// Trim prefix if the specialist is a pediatric doctor.
	specialty = strings.TrimPrefix(specialty, "детский ")

	return entities.Specialty(strings.TrimSpace(specialty))
}

func shiftMonthDay(t time.Time) func(days int) time.Time {
	const day = 24 * time.Hour
	firstDayOfMonth := time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, time.Local)
	return func(days int) time.Time {
		return firstDayOfMonth.Add(time.Duration(days) * day)
	}
}

func addHours(t time.Time, hours int) time.Time {
	return t.Add(time.Hour * time.Duration(hours))
}

func addHoursGap(t time.Time, hours int) time.Time {
	return t.Add(time.Hour*time.Duration(hours) - time.Millisecond)
}

func (s *Service) DebugSchedule(ctx context.Context, when time.Time) error {
	// Get staff from the database.
	staffFromDB, err := s.staffRepo.GetAll(ctx)
	if err != nil {
		return fmt.Errorf("get staff from database: %w", err)
	}

	// Get schedule from the Google Sheets.
	shifts, err := s.getScheduleFromSheets(ctx, when)
	if err != nil {
		return fmt.Errorf("failed to get schedule from sheets: %w", err)
	}

	// Loop over shifts to populate employee with the actual
	// information from database.
	for _, shift := range shifts {
		// Return error if any specialty doesn't exists in DB.
		if staffFromDB[shift.Employee.Specialty] == nil {
			return fmt.Errorf(
				"no such specialty in staff table: %s",
				shift.Employee.Specialty,
			)
		}
		// Substitute uncompleted sheets employee record with
		// actual one from the database.
		for _, spec := range staffFromDB[shift.Employee.Specialty] {
			if spec.FirstName == shift.Employee.FirstName &&
				spec.LastName == shift.Employee.LastName &&
				spec.MiddleName == shift.Employee.MiddleName {
				shift.Employee = spec
				break
			}
		}
	}

	// Debug print.
	for _, shift := range shifts {
		fmt.Printf(
			"ID: %d\tSPEC: %s(%s)\t%s %s %s\t\t\tSTART: %s\tEND: %s\tADULTS: %t\n",
			shift.Employee.ID,
			shift.Employee.Specialty,
			shift.Employee.EmiasSpecialty,
			shift.Employee.LastName,
			shift.Employee.FirstName,
			shift.Employee.MiddleName,
			shift.Start.Local(),
			shift.End.Local(),
			shift.Employee.ForAdults,
		)
	}

	return nil
}
