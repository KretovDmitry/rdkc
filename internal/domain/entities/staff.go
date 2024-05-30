package entities

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
