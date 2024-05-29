package interfaces

import (
	"context"
	"time"

	"github.com/KretovDmitry/rdkc/internal/domain/entities"
	"github.com/KretovDmitry/rdkc/internal/domain/entities/user"
)

// AuthService represents all service actions.
type AuthService interface {
	Register(ctx context.Context, login, password string) (user.ID, error)
	Login(ctx context.Context, login, password string) (*user.User, error)
	BuildAuthToken(user.ID) (string, error)
	GetUserFromToken(ctx context.Context, token string) (*user.User, error)
}

type ScheduleService interface {
	GetMonth(context.Context, time.Month) error
}

type SheetsService interface {
	GetSchedule(context.Context) (entities.Shifts, error)
	GetMonth(context.Context, time.Month) error
}
