package main

import (
	"github.com/go-chi/chi/v5"
	"github.com/rs/zerolog"
)

type site struct {
	router *chi.Mux
	logger *zerolog.Logger
}

func newSite(router *chi.Mux, logger *zerolog.Logger) *site {
	return &site{
		router: router,
		logger: componentLogger(logger, "site"),
	}
}
