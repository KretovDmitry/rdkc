package emias

import (
	"runtime"
	"strings"
	"time"
)

// logCallDuration logs the duration of the caller's execution.
func (e *Emias) logCallDuration(start time.Time) {
	pc, _, _, ok := runtime.Caller(1)
	details := runtime.FuncForPC(pc)
	if ok && details != nil {
		idx := strings.LastIndexByte(details.Name(), '/')
		e.logger.Infof(
			"emias call by %q in %v",
			details.Name()[idx+1:], time.Since(start),
		)
	}
}

// convertHospitalName converts a hospital name to its standardized form.
// If the hospital name is not found in the standardized list,
// it is returned unchanged.
func convertHospitalName(hospital string) string {
	if h, ok := hospitalsMap[hospital]; ok {
		return h
	}
	return hospital
}
