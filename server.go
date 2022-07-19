package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/rs/zerolog"
)

type server struct {
	s      *http.Server
	logger *zerolog.Logger
}

func newServer(config *configuration, router *mux.Router, logger *zerolog.Logger) *server {
	logger = componentLogger(logger, "server")

	var handler http.Handler = router
	handler = handlers.CompressHandler(handler)
	handler = handlers.LoggingHandler(logger, handler)
	handler = handlers.RecoveryHandler()(handler)

	return &server{
		s: &http.Server{
			Addr:    config.Server.Address,
			Handler: handler,
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
