package models

import "time"

type (
	Specialty string
	Column    string

	Staff struct {
		ID             int
		Specialty      Specialty
		EmiasSpecialty string
		LastName       string
		FirstName      string
		MiddleName     string
		Email          string
		Phone          string
		ForAdults      bool
	}

	Shift struct {
		Staff Staff
		Start time.Time
		End   time.Time
	}

	Shifts []*Shift

	Schedule map[time.Time]Shifts
)
