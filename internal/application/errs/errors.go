package errs

import (
	"errors"
)

// Common sentinel errors.
var (
	ErrNotFound           = errors.New("not found")
	ErrRateLimit          = errors.New("rate limit")
	ErrDataConflict       = errors.New("data conflict")
	ErrNilDependency      = errors.New("nil dependency")
	ErrAlreadyExists      = errors.New("already exists")
	ErrInvalidRequest     = errors.New("invalid request")
	ErrNotEnoughFunds     = errors.New("not enough funds")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrInvalidOrderNumber = errors.New("invalid order number")
)

// Type just for marshalling purpose.
// Should only be used immediately before marshalling.
type JSON struct {
	Error string `json:"error"`
}
