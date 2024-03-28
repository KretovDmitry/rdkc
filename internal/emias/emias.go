package emias

import (
	"fmt"
	"net/http"
	"net/http/cookiejar"
	"time"
)

const (
	scheme = "https"
	host   = "hospital.emias.mosreg.ru"
)

type emiasClient struct {
	*http.Client
}

func NewClient() (*emiasClient, error) {
	jar, err := cookiejar.New(nil)
	if err != nil {
		return nil, fmt.Errorf("create new cookie jar: %w", err)
	}

	return &emiasClient{&http.Client{
		Jar: jar,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			fmt.Println("emias redirect: ", req.URL)
			return nil
		},
		Timeout: time.Minute * 5,
	}}, nil
}

func (c *emiasClient) Synchronize() error {
	if err := c.authorize(); err != nil {
		return fmt.Errorf("authorize: %w", err)
	}

	if err := c.loadServicesData(); err != nil {
		return fmt.Errorf("loadGrid: %w", err)
	}

	return nil
}
