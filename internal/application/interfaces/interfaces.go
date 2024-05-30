package interfaces

import (
	"context"
	"time"

	"github.com/KretovDmitry/rdkc/internal/domain/entities/user"
	"google.golang.org/api/sheets/v4"
)

// AuthService represents all service actions.
type AuthService interface {
	Register(ctx context.Context, login, password string) (user.ID, error)
	Login(ctx context.Context, login, password string) (*user.User, error)
	BuildAuthToken(user.ID) (string, error)
	GetUserFromToken(ctx context.Context, token string) (*user.User, error)
}

type ScheduleService interface {
	UpdateStaff(ctx context.Context) error
	UpdateSchedule(ctx context.Context, when time.Time) error
}

type SheetsService interface {
	GetValuesFromRange(ctx context.Context, readRange string) (*sheets.ValueRange, error)
}
