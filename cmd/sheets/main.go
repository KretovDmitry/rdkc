package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/KretovDmitry/rdkc/internal/config"
	"github.com/KretovDmitry/rdkc/internal/sheets"
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

	shifts, err := sheetsInstance.GetSchedule(ctx)
	if err != nil {
		log.Fatalf("unable to retrieve shifts: %v", err)
	}

	for _, shift := range shifts {
		fmt.Printf("%#v\n", *shift)
	}

	// contacts, err := sheetsInstance.GetContacts(ctx)
	// if err != nil {
	// 	log.Fatalf("unable to retrieve contacts: %v", err)
	// }

	// for specialty, doctors := range contacts {
	// 	fmt.Printf("%[1]T: %[1]s\n", specialty)
	// 	fmt.Printf("%[1]T\n", doctors)

	// 	for _, doctor := range doctors {
	// 		fmt.Printf("%#v\n", *doctor)
	// 	}
	// 	fmt.Println()
	// }

	fmt.Printf("execution time: %s\n", time.Since(begin))
}
