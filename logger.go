package main

import (
	"log/slog"
	"os"

	"github.com/lmittmann/tint"
)

func newLogger() *slog.Logger {
	var handler slog.Handler = slog.NewJSONHandler(os.Stdout, nil)

	pretty, _ := os.LookupEnv("LOG_PRETTY")
	if pretty == "true" {
		color, _ := os.LookupEnv("LOG_COLOR")

		handler = tint.NewHandler(os.Stdout, &tint.Options{
			TimeFormat: "2006-01-02 15:04:05.000",
			NoColor:    color != "true",
		})
	}

	return slog.New(handler)
}

func componentLogger(logger *slog.Logger, name string) *slog.Logger {
	return logger.With(slog.String("component", name))
}
