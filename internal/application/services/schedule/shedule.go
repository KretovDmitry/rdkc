package schedule

import (
	"context"
	"fmt"
	"time"

	"github.com/KretovDmitry/rdkc/internal/application/errs"
	"github.com/KretovDmitry/rdkc/internal/application/interfaces"
	"github.com/KretovDmitry/rdkc/internal/application/repositories"
	"github.com/KretovDmitry/rdkc/internal/sheets"
	"github.com/KretovDmitry/rdkc/pkg/logger"
)

type Service struct {
	staffRepo    repositories.StaffRepository
	scheduleRepo repositories.ScheduleRepository
	sheets       *sheets.App
	logger       logger.Logger
}

var _ interfaces.ScheduleService = (*Service)(nil)

func New(
	staffRepo repositories.StaffRepository,
	scheduleRepo repositories.ScheduleRepository,
	sheets *sheets.App,
	logger logger.Logger,
) (*Service, error) {
	if staffRepo == nil {
		return nil, fmt.Errorf("%w: staff repository", errs.ErrNilDependency)
	}
	if scheduleRepo == nil {
		return nil, fmt.Errorf("%w: schedule repository", errs.ErrNilDependency)
	}
	if sheets == nil {
		return nil, fmt.Errorf("%w: *sheets.App", errs.ErrNilDependency)
	}
	if logger == nil {
		return nil, fmt.Errorf("%w: logger", errs.ErrNilDependency)
	}

	return &Service{
		staffRepo:    staffRepo,
		scheduleRepo: scheduleRepo,
		sheets:       sheets,
		logger:       logger,
	}, nil
}

func (s *Service) GetMonth(ctx context.Context, month time.Month) error {
	return nil
}
