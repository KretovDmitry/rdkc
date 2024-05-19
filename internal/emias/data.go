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
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type serviceQueryParams struct {
	Id      string
	BegDate string
	EndDate string
	Limit   string
}

func newServiceQueryParams(id string) serviceQueryParams {
	now := time.Now()
	return serviceQueryParams{
		Id:      id,
		BegDate: now.Format("02.01.2006"),
		EndDate: now.Format("02.01.2006"),
		Limit:   "200",
	}
}

type (
	serviceResponse struct {
		Data []serviceResponseItem `json:"data,omitempty"`
	}

	serviceResponseItem struct {
		PatientId    string `json:"Person_id,omitempty"`
		PatientFIO   string `json:"Person_FIO,omitempty"`
		RequestID    string `json:"EnvDirection_Num,omitempty"`
		Diagnosis    string `json:"Diag_FullName,omitempty"`
		Specialty    string `json:"LpuSectionProfile_Name,omitempty"`
		Status       string `json:"EvnDirectionStatus_SysNick,omitempty"`
		Hospital     string `json:"Lpu_Nick,omitempty"`
		CreationDate string `json:"EvnDirection_insDate,omitempty"`
		CreationTime string `json:"EvnDirection_insTime,omitempty"`
		Result       string `json:"evndirection_result,omitempty"`
	}
)

func newServiceResponse() *serviceResponse {
	return &serviceResponse{
		Data: make([]serviceResponseItem, 0),
	}
}

func (r serviceResponseItem) String() string {
	caser := cases.Title(language.Russian)
	return fmt.Sprintf(`
%s	%s
	Diagnosis: %s
	Specialty: %s
	Status: %s
	Result: %s
	Hospital: %s
	Created: %s	%s
	`,
		caser.String(r.PatientFIO), r.PatientId,
		r.Diagnosis,
		r.Specialty,
		r.Status,
		r.Result,
		convertHospitalName(r.Hospital),
		r.CreationDate, r.CreationTime)
}

// loadServicesData loads data form each service of the emias
func (c *emiasClient) loadServicesData(ctx context.Context) error {
	servicesID := []string{"11380", "500801000003930", "500801000010630"}

	work := c.serviceRequestGenerator(servicesID)

	defer c.logCallDuration(time.Now())
	eg, ctx := errgroup.WithContext(ctx)

	resultChan := make(chan []serviceResponseItem, len(servicesID))
	allResults := make([]serviceResponseItem, 0)

	// read all results into an array
	eg.Go(func() error {
		returned := 0
		for {
			select {
			case <-ctx.Done():
				return context.Canceled
			case shifts := <-resultChan:
				returned++
				allResults = append(allResults, shifts...)
				if returned == len(servicesID) {
					return nil
				}
			}
		}
	})

	for req := range work {
		req := req
		eg.Go(func() error {
			if err := c.loadServiceData(req, resultChan); err != nil {
				return err
			}
			return nil
		})
	}

	if err := eg.Wait(); err != nil {
		return err
	}

	for _, resp := range allResults {
		fmt.Println(resp)
	}

	return nil
}

func (c *emiasClient) loadServiceData(r *http.Request, resultChan chan []serviceResponseItem) error {
	defer c.logCallDuration(time.Now())

	response, err := c.Do(r)
	if err != nil {
		return fmt.Errorf("do a request: %w", err)
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

func (c *emiasClient) serviceRequestGenerator(servicesID []string) chan *http.Request {
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

			req, _ := http.NewRequest(http.MethodPost, gridURL.String(), strings.NewReader(data.Encode()))

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
