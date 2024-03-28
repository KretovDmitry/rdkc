package emias

import (
	"log"
	"runtime"
	"time"
)

// logCallDuration logs the duration of the caller's execution
func logCallDuration(start time.Time) {
	pc, _, _, ok := runtime.Caller(1)
	details := runtime.FuncForPC(pc)
	if ok && details != nil {
		log.Printf("%s %s\n", details.Name(), time.Since(start))
	}
}
