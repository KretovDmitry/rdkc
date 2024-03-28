package emias

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"sync"
	"time"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type gridPayloadEntity struct {
	Id      string `json:"MedService_id,omitempty"`
	BegDate string `json:"beg_date,omitempty"`
	EndDate string `json:"end_date,omitempty"`
	Limit   string `json:"limit,omitempty"`
}

func newGridPayloadEntity(id string) gridPayloadEntity {
	ct := time.Now()
	return gridPayloadEntity{
		Id:      id,
		BegDate: ct.Format("02.01.2006"),
		EndDate: ct.Format("02.01.2006"),
		Limit:   "200",
	}
}

const (
	reanimationGridId = "11380"
	tmkGridId         = "500801000003930"
	childrenGridId    = "500801000010630"
)

var gridPayload = [...]gridPayloadEntity{
	newGridPayloadEntity(reanimationGridId),
	newGridPayloadEntity(tmkGridId),
	newGridPayloadEntity(childrenGridId),
}

type (
	serviceResponse struct {
		Data []serviceResponseItem `json:"data,omitempty"`
	}

	serviceResponseItem struct {
		PatientId    string `json:"Person_id,omitempty"`
		PatientFIO   string `json:"Person_FIO,omitempty"`
		RequestId    string `json:"EnvDirection_Num,omitempty"`
		Diagnosis    string `json:"Diag_FullName,omitempty"`
		Specialty    string `json:"LpuSectionProfile_Name,omitempty"`
		Status       string `json:"EvnDirectionStatus_SysNick,omitempty"`
		Hospital     string `json:"Lpu_Nick,omitempty"`
		CreationDate string `json:"EvnDirection_insDate,omitempty"`
		CreationTime string `json:"EvnDirection_insTime,omitempty"`
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
	Hospital: %s
	Created: %s	%s
	`, caser.String(r.PatientFIO),
		r.PatientId, r.Diagnosis, r.Specialty, r.Status,
		r.Hospital, r.CreationDate, r.CreationTime)
}

// loadServicesData loads data form each service of the emias
func (c *emiasClient) loadServicesData() error {
	defer logCallDuration(time.Now())
	var wg sync.WaitGroup

	gridURL := url.URL{
		Scheme: scheme,
		Host:   host,
	}

	q := gridURL.Query()
	q.Set("c", "EvnUslugaTelemed")
	q.Set("m", "loadWorkPlaceGrid")
	gridURL.RawQuery = q.Encode()

	for _, entity := range gridPayload {
		data := url.Values{}
		data.Set("MedService_id", entity.Id)
		data.Set("begDate", entity.BegDate)
		data.Set("endDate", entity.EndDate)
		data.Set("limit", entity.Limit)

		request, err := http.NewRequest(
			http.MethodPost, gridURL.String(), strings.NewReader(data.Encode()))
		if err != nil {
			return fmt.Errorf("create new request: %w", err)
		}

		request.Header.Set("connection", "keep-alive")
		request.Header.Set("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36")
		request.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		request.Header.Set("Content-Length", strconv.Itoa(len(data.Encode())))

		wg.Add(1)
		go func() {
			defer wg.Done()
			resp, err := c.loadServiceData(request)
			if err != nil {
				fmt.Println(err)
			}
			for _, e := range (*resp).Data {
				fmt.Println(e)
			}
		}()
	}

	wg.Wait()

	return nil
}

func (c *emiasClient) loadServiceData(r *http.Request) (*serviceResponse, error) {
	defer logCallDuration(time.Now())

	response, err := c.Do(r)
	if err != nil {
		return nil, fmt.Errorf("do a request: %w", err)
	}
	defer response.Body.Close()

	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, fmt.Errorf("read response body: %w", err)
	}

	data := newServiceResponse()

	if err := json.Unmarshal(body, data); err != nil {
		return nil, fmt.Errorf("unmarshal response: %w", err)
	}

	return data, nil
}
