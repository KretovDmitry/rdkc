package main

import (
	"context"
	"fmt"

	"github.com/KretovDmitry/rdkc/internal/app"
	"github.com/KretovDmitry/rdkc/internal/config"
	"github.com/KretovDmitry/rdkc/internal/db/postgres"
	"github.com/KretovDmitry/rdkc/internal/logger"
	"go.uber.org/zap"
)

func main() {
	l := logger.Get()
	defer l.Sync()

	// Server run context
	serverCtx, serverStopCtx := context.WithCancel(context.Background())
	defer serverStopCtx()

	// mux, err := initService(serverCtx)
	// if err != nil {
	// 	l.Fatal("init service failed", zap.Error(err))
	// }

	// server := &http.Server{
	// 	Addr:    config.AddrToRun.String(),
	// 	Handler: mux,
	// }

	// sig := make(chan os.Signal, 1)
	// signal.Notify(sig, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT, os.Interrupt)
	// go func() {
	// 	<-sig

	// 	err := server.Shutdown(serverCtx)
	// 	if err != nil {
	// 		l.Fatal("graceful shutdown failed", zap.Error(err))
	// 	}
	// 	serverStopCtx()
	// }()

	// l.Info("Server has started", zap.String("addr", config.AddrToRun.String()))
	// err = server.ListenAndServe()
	// if err != nil && err != http.ErrServerClosed {
	// 	l.Fatal("ListenAndServe failed", zap.Error(err))
	// }

	// // Wait for server context to be stopped
	// select {
	// case <-serverCtx.Done():
	// case <-time.After(30 * time.Second):
	// 	l.Fatal("graceful shutdown timed out.. forcing exit")
	// }
	app, err := initService(serverCtx)
	if err != nil {
		l.Fatal("init service failed", zap.Error(err))
	}

	// staff, err := app.GetStaff(serverCtx)
	// if err != nil {
	// 	l.Fatal("get staff failed", zap.Error(err))
	// }

	// for specialty, doctors := range staff {
	// 	fmt.Printf("%[1]T: %[1]s\n", specialty)
	// 	fmt.Printf("%[1]T\n", doctors)

	// 	// fmt.Println(doctors)
	// 	for _, doctor := range doctors {
	// 		fmt.Printf("%#v\n", *doctor)
	// 	}
	// 	fmt.Println()
	// }

	_, err = app.GetSchedule(serverCtx)
	if err != nil {
		l.Fatal("get schedule failed", zap.Error(err))
	}
}

func initService(ctx context.Context) (*app.App, error) {
	err := config.Parse(ctx)
	if err != nil {
		return nil, fmt.Errorf("parse flags: %w", err)
	}

	db, err := postgres.Connect(ctx, config.DSN)
	if err != nil {
		return nil, fmt.Errorf("new store: %w", err)
	}

	app, err := app.New(ctx, db)
	if err != nil {
		return nil, fmt.Errorf("new handler context: %w", err)
	}

	return app, nil
}
