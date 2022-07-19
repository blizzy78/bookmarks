package main

import (
	"github.com/gorilla/mux"
	"github.com/rs/zerolog"
)

type site struct {
	router *mux.Router
	logger *zerolog.Logger
}

func newSite(router *mux.Router, logger *zerolog.Logger) *site {
	return &site{
		router: router,
		logger: componentLogger(logger, "site"),
	}
}
