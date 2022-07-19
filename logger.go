package main

import (
	"io"
	"os"

	"github.com/rs/zerolog"
)

func newLogger() *zerolog.Logger {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnixMs

	logWriter := io.Writer(os.Stdout)

	pretty, _ := os.LookupEnv("LOG_PRETTY")
	if pretty != "" {
		consWriter := zerolog.NewConsoleWriter()
		consWriter.TimeFormat = "2006-01-02 15:04:05.000"

		color, _ := os.LookupEnv("LOG_COLOR")
		if color == "" {
			consWriter.NoColor = true
		}

		logWriter = consWriter
	}

	l := zerolog.New(logWriter).With().Timestamp().Logger()

	return &l
}

func componentLogger(logger *zerolog.Logger, name string) *zerolog.Logger {
	log := logger.With().Str("component", name).Logger()
	return &log
}
