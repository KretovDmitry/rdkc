package main

import (
	"context"
	"fmt"
	"log"
	"rdkc/internal/config"
	"rdkc/internal/sheets"
	"time"
)

func main() {
	begin := time.Now()

	ctx := context.Background()

	if err := config.Parse(ctx); err != nil {
		log.Fatalf("unable to parse config: %v", err)
	}

	sheetsInstance, err := sheets.New(ctx)
	if err != nil {
		log.Fatalf("unable to create app: %v", err)
	}

	shifts, err := sheetsInstance.GetShifts(ctx)
	if err != nil {
		log.Fatalf("unable to retrieve shifts: %v", err)
	}

	for _, shift := range shifts {
		fmt.Println(*shift)
	}

	fmt.Printf("execution time: %s\n", time.Since(begin))
}
