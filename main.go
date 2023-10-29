package main

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/go-chi/chi/v5"
)

func main() {
	logger := newLogger()

	code := 0

	if err := run(logger); err != nil {
		logger.Error("run", slog.Any("err", err))

		code = 1
	}

	logger.Info("exit")

	os.Exit(code)
}

func run(logger *slog.Logger) error {
	config, err := loadConfig()
	if err != nil {
		return err
	}

	bookmarks := newBookmarks(config, logger)
	router := chi.NewRouter()
	rest := newREST(bookmarks, router, logger)
	server := newServer(config, router, logger)

	rest.start()

	stopServer, err := server.start()
	if err != nil {
		return err
	}

	defer func() {
		if err := stopServer(context.Background()); err != nil {
			logger.Error("stop server", slog.Any("err", err))
		}
	}()

	waitForSignal(logger)

	return nil
}

func waitForSignal(logger *slog.Logger) {
	ch := make(chan os.Signal, 1)

	signal.Notify(ch, syscall.SIGINT, syscall.SIGTERM)

	<-ch
	logger.Info("received exit signal")
}
