package entities

import "time"

type (
	Shift struct {
		Employee Employee
		Start    time.Time
		End      time.Time
	}

	Shifts []*Shift

	Schedule map[time.Time]Shifts
)
