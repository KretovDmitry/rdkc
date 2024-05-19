package emias

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"golang.org/x/sync/errgroup"
)

// loadServicesData loads data form every service of the emias.
func (c *Emias) loadServicesData(ctx context.Context) ([]serviceResponseItem, error) {
	servicesID := []string{"11380", "500801000003930", "500801000010630"}

	requestsCh := c.serviceRequestGenerator(ctx, servicesID)

	defer c.logCallDuration(time.Now())
	eg, ctx := errgroup.WithContext(ctx)

	resultChan := make(chan []serviceResponseItem, len(servicesID))
	allResults := make([]serviceResponseItem, 0)

	eg.Go(func() error {
		returned := 0
		for {
			select {
			case <-ctx.Done():
				return ctx.Err()
			case res := <-resultChan:
				returned++
				allResults = append(allResults, res...)
				if returned == len(servicesID) {
					return nil
				}
			}
		}
	})

	for req := range requestsCh {
		req := req
		eg.Go(func() error {
			if err := c.loadServiceData(req, resultChan); err != nil {
				return err
			}
			return nil
		})
	}

	if err := eg.Wait(); err != nil {
		return nil, err
	}

	return allResults, nil
}

func (c *Emias) loadServiceData(r *http.Request, resultChan chan []serviceResponseItem) error {
	defer c.logCallDuration(time.Now())

	response, err := c.client.Do(r)
	if err != nil {
		return fmt.Errorf("do a load service data request: %w", err)
	}

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return fmt.Errorf("read response body: %w", err)
	}
	response.Body.Close()

	data := newServiceResponse()

	if err := json.Unmarshal(body, data); err != nil {
		return fmt.Errorf("unmarshal response: %w", err)
	}

	resultChan <- data.Data

	return nil
}

func (c *Emias) serviceRequestGenerator(ctx context.Context, servicesID []string) chan *http.Request {
	gridURL := url.URL{
		Scheme: c.config.Emias.Scheme,
		Host:   c.config.Emias.Host,
	}

	q := gridURL.Query()
	q.Set("c", "EvnUslugaTelemed")
	q.Set("m", "loadWorkPlaceGrid")
	gridURL.RawQuery = q.Encode()

	work := make(chan *http.Request, len(servicesID))

	go func() {
		for _, id := range servicesID {
			data := url.Values{}
			data.Set("MedService_id", id)
			data.Set("begDate", time.Now().Format("02.01.2006"))
			data.Set("endDate", time.Now().Format("02.01.2006"))
			data.Set("limit", "200")

			req, _ := http.NewRequestWithContext(
				ctx,
				http.MethodPost,
				gridURL.String(),
				strings.NewReader(data.Encode()),
			)

			req.Header.Set("connection", "keep-alive")
			req.Header.Set("user-agent", c.config.Emias.UserAgent)
			req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
			req.Header.Set("Content-Length", strconv.Itoa(len(data.Encode())))

			work <- req
		}

		close(work)
	}()

	return work
}
