package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/gorilla/mux"
	"github.com/rs/zerolog"
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
	config, err := loadConfig()
	if err != nil {
		return err
	}

	bookmarks := newBookmarks(config, logger)
	router := mux.NewRouter()
	rest := newREST(bookmarks, router, logger)
	site := newSite(router, logger)
	server := newServer(config, router, logger)

	rest.start()

	if err = site.start(); err != nil {
		return err
	}

	stopServer, err := server.start()
	if err != nil {
		return err
	}

	defer func() {
		if err := stopServer(context.Background()); err != nil {
			logger.Err(err).Msg("stop server")
		}
	}()

	waitForSignal(logger)

	return nil
}

func waitForSignal(logger *zerolog.Logger) {
	ch := make(chan os.Signal, 1)

	signal.Notify(ch, syscall.SIGINT, syscall.SIGTERM)

	<-ch
	logger.Info().Msg("received exit signal")
}
