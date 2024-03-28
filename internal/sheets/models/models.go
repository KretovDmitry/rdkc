package models

import "time"

type (
	Specialty string
	Column    string

	Shift struct {
		StaffId string
		Start   time.Time
		End     time.Time
	}

	Shifts []*Shift
)
