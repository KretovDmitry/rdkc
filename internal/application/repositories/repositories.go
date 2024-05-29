package repositories

import (
	"context"

	"github.com/KretovDmitry/rdkc/internal/domain/entities"
	"github.com/KretovDmitry/rdkc/internal/domain/entities/user"
)

type UserRepository interface {
	GetUserByID(context.Context, user.ID) (*user.User, error)
	GetUserByLogin(ctx context.Context, login string) (*user.User, error)
	CreateUser(ctx context.Context, login, password string) (user.ID, error)
}

type StaffRepository interface {
	GetAll(context.Context) (map[string]entities.Staff, error)
	SaveAll(context.Context, entities.Staff) error
}

type ScheduleRepository interface {
	Update(context.Context, entities.Shifts) error
}
