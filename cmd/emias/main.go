package main

import (
	"context"
	"fmt"
	"log"

	"github.com/KretovDmitry/rdkc/internal/config"
	"github.com/KretovDmitry/rdkc/internal/emias"
)

func main() {
	ctx := context.Background()

	if err := run(ctx); err != nil {
		log.Fatal(err)
	}
}

func run(ctx context.Context) error {
	err := config.Parse(ctx)
	if err != nil {
		return fmt.Errorf("parse flags: %w", err)
	}

	emiasClient, err := emias.NewClient()
	if err != nil {
		return fmt.Errorf("create new emias client: %w", err)
	}

	if err := emiasClient.Synchronize(ctx); err != nil {
		return fmt.Errorf("emias: %w", err)
	}

	return nil
}
