package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/zerolog"
)

type server struct {
	s      *http.Server
	logger *zerolog.Logger
}

func newServer(config *configuration, router *chi.Mux, logger *zerolog.Logger) *server {
	logger = componentLogger(logger, "server")

	router.Use(
		middleware.Logger,
		middleware.Recoverer,
		middleware.Compress(5),
	)

	return &server{
		s: &http.Server{
			Addr:              config.Server.Address,
			Handler:           router,
			ReadHeaderTimeout: 5 * time.Second,
			ReadTimeout:       10 * time.Second,
		},
		logger: logger,
	}
}

func (server *server) start() (func(ctx context.Context) error, error) {
	listener, err := net.Listen("tcp", server.s.Addr)
	if err != nil {
		return func(_ context.Context) error {
			return nil
		}, fmt.Errorf("listen: %w", err)
	}

	go func() {
		_ = server.s.Serve(listener)
	}()

	server.logger.Info().Str("address", server.s.Addr).Msg("server running")

	return func(ctx context.Context) error {
		server.logger.Info().Msg("shutdown server")

		ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
		defer cancel()

		if err := server.s.Shutdown(ctx); err != nil {
			return fmt.Errorf("shutdown: %w", err)
		}

		return nil
	}, nil
}
