package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/rs/zerolog"
	"go.uber.org/fx"
)

func main() {
	logger := newLogger()

	code := 0

	if err := run(logger); err != nil {
		logger.Fatal().Err(err).Msg("run")

		code = 1
	}

	logger.Info().Msg("exit")

	os.Exit(code)
}

func run(logger *zerolog.Logger) error {
	app := fx.New(
		fx.WithLogger(newFXLogger(logger, zerolog.WarnLevel)),

		fx.Supply(logger),

		fx.Provide(
			loadConfig,
			newMux,
			newServer,
			newBookmarks,
			newSite,
			newREST,
		),

		fx.Invoke(func(rest, site, *http.Server) {}),
	)

	if err := app.Err(); err != nil {
		return err
	}

	app.Run()

	return nil
}

func newMux() *mux.Router {
	router := mux.NewRouter()

	router.Use(
		handlers.RecoveryHandler(),
		handlers.CompressHandler,
	)

	return router
}

func newServer(lifecycle fx.Lifecycle, router *mux.Router, config *configuration, logger *zerolog.Logger) *http.Server {
	logger = componentLogger(logger, "server")

	server := http.Server{
		Addr:    config.Server.Address,
		Handler: handlers.LoggingHandler(logger, router),
	}

	lifecycle.Append(fx.Hook{
		OnStart: func(context.Context) error {
			listener, err := net.Listen("tcp", server.Addr)
			if err != nil {
				return fmt.Errorf("listen: %w", err)
			}

			go func() {
				_ = server.Serve(listener)
			}()

			logger.Info().Str("address", server.Addr).Msg("web server running")

			return nil
		},

		OnStop: func(ctx context.Context) error {
			logger.Info().Msg("shutdown web server")

			ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
			defer cancel()

			if err := server.Shutdown(ctx); err != nil {
				return fmt.Errorf("shutdown: %w", err)
			}

			return nil
		},
	})

	return &server
}
