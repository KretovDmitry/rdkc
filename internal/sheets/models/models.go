package models

import "time"

type (
	Specialty string
	Column    string

	Staff struct {
		ID          int
		FullName    string
		Email       string
		Phone       string
		Specialty   Specialty
		ForChildren bool
	}

	Shift struct {
		Staff Staff
		Start time.Time
		End   time.Time
	}

	Shifts []*Shift
)
