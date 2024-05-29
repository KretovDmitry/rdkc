package entities

type (
	Employee struct {
		ID             int
		Specialty      string
		EmiasSpecialty string
		LastName       string
		FirstName      string
		MiddleName     string
		Email          string
		Phone          string
		ForAdults      bool
	}

	Staff []*Employee
)
