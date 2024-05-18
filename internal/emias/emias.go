package emias

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/cookiejar"

	"github.com/KretovDmitry/rdkc/internal/config"
	"github.com/KretovDmitry/rdkc/internal/logger"
)

type emiasClient struct {
	*http.Client
	config *config.Config
	logger logger.Logger
}

func NewClient(config *config.Config, logger logger.Logger) (*emiasClient, error) {
	if config == nil {
		return nil, errors.New("nil dependency: config")
	}

	jar, err := cookiejar.New(nil)
	if err != nil {
		return nil, fmt.Errorf("create new cookie jar: %w", err)
	}

	return &emiasClient{
		&http.Client{
			Jar: jar,
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				fmt.Println("emias redirect: ", req.URL)
				return nil
			},
			Timeout: config.Emias.Timeout,
		},
		config,
		logger,
	}, nil
}

func (c *emiasClient) Synchronize(ctx context.Context) error {
	if err := c.authorize(ctx); err != nil {
		return fmt.Errorf("authorize: %w", err)
	}

	if err := c.loadServicesData(ctx); err != nil {
		return fmt.Errorf("loadGrid: %w", err)
	}

	return nil
}
