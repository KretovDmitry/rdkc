package entities

import (
	"strings"
)

type (
	Specialty string

	Employee struct {
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

	Staff []*Employee

	StaffBySpecialty map[Specialty]Staff
)

func (e *Employee) SetNameFromFullName(fullName string) {
	name := strings.Split(strings.TrimSpace(fullName), " ")
	for i := range name {
		name[i] = strings.TrimSpace(name[i])
	}
	switch len(name) {
	case 3:
		e.LastName = name[0]
		e.FirstName = name[1]
		e.MiddleName = name[2]
	case 2:
		e.LastName = name[0]
		e.FirstName = name[1]
	case 1:
		e.LastName = name[0]
	default:
		e.LastName = name[0]
		e.FirstName = name[1]
		e.MiddleName = strings.Join(name[2:], " ")
	}
}
