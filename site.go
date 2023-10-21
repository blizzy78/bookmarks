package main

import (
	"log/slog"

	"github.com/go-chi/chi/v5"
)

type site struct {
	router *chi.Mux
	logger *slog.Logger
}

func newSite(router *chi.Mux, logger *slog.Logger) *site {
	return &site{
		router: router,
		logger: componentLogger(logger, "site"),
	}
}
