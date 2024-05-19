package emias

import (
	"runtime"
	"time"

	"go.uber.org/zap"
)

// logCallDuration logs the duration of the caller's execution
func (client *emiasClient) logCallDuration(start time.Time) {
	pc, _, _, ok := runtime.Caller(1)
	details := runtime.FuncForPC(pc)
	if ok && details != nil {
		client.logger.Info(
			"emias call",
			zap.String("func", details.Name()),
			zap.Duration("duration", time.Since(start)),
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
