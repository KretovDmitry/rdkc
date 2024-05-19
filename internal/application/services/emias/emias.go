package emias

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/cookiejar"

	"github.com/KretovDmitry/rdkc/internal/config"
	"github.com/KretovDmitry/rdkc/pkg/logger"
)

type Emias struct {
	client *http.Client
	config *config.Config
	logger logger.Logger
}

func New(config *config.Config, logger logger.Logger) (*Emias, error) {
	if config == nil {
		return nil, errors.New("nil dependency: config")
	}

	jar, err := cookiejar.New(nil)
	if err != nil {
		return nil, fmt.Errorf("create new cookie jar: %w", err)
	}

	return &Emias{
		client: &http.Client{
			Jar: jar,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				logger.Errorf("emias redirect: %s", req.URL)
				return nil
			},
			Timeout: config.Emias.Timeout,
		},
		config: config,
		logger: logger,
	}, nil
}

func (e *Emias) Synchronize(ctx context.Context) error {
	if err := e.authorize(ctx); err != nil {
		return fmt.Errorf("authorize: %w", err)
	}

	data, err := e.loadServicesData(ctx)
	if err != nil {
		return fmt.Errorf("loadGrid: %w", err)
	}

	for _, resp := range data {
		fmt.Println(resp)
	}

	return nil
}
