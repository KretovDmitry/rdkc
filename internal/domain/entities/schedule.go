package entities

import "time"

type (
	Column string

	ColumnBySpecialty map[Specialty]Column

	Shift struct {
		Employee *Employee
		Start    time.Time
		End      time.Time
	}

	Shifts []*Shift

	Schedule map[time.Time]Shifts
)
