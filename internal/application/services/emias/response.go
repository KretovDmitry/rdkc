package emias

import (
	"fmt"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type (
	authResponse struct {
		Success bool `json:"success,omitempty"`
	}

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
