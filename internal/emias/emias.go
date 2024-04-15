package emias

import (
	"context"
	"fmt"
	"net/http"
	"net/http/cookiejar"
	"time"

	"github.com/KretovDmitry/rdkc/internal/logger"
	"go.uber.org/zap"
)

const (
	scheme = "https"
	host   = "hospital.emias.mosreg.ru"
)

type emiasClient struct {
	*http.Client
	logger *zap.Logger
}

func NewClient() (*emiasClient, error) {
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
			Timeout: time.Minute * 5,
		},
		logger.Get(),
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
