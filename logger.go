package main

import (
	"io"
	"os"
	"strings"

	"github.com/rs/zerolog"
	"go.uber.org/fx/fxevent"
)

type fxLogger zerolog.Logger

var _ fxevent.Logger = (*fxLogger)(nil)

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

func newFXLogger(logger *zerolog.Logger, level zerolog.Level) func() fxevent.Logger {
	return func() fxevent.Logger {
		log := componentLogger(logger, "FX").Level(level)
		return (*fxLogger)(&log)
	}
}

func (fxl *fxLogger) LogEvent(event fxevent.Event) { //nolint:gocognit,cyclop // it's just a type switch
	logger := (*zerolog.Logger)(fxl)

	switch fxe := event.(type) {
	case *fxevent.OnStartExecuting:
		logger.Info().Str("callee", fxe.FunctionName).Str("caller", fxe.CallerName).Msg("execute OnStart hook")

	case *fxevent.OnStartExecuted:
		if fxe.Err != nil {
			logger.Info().Str("callee", fxe.FunctionName).Str("caller", fxe.CallerName).Err(fxe.Err).Msg("OnStart hook failed")
			return
		}

		logger.Info().Str("callee", fxe.FunctionName).Str("caller", fxe.CallerName).Dur("runtime", fxe.Runtime).Msg("OnStart hook executed")

	case *fxevent.OnStopExecuting:
		logger.Info().Str("callee", fxe.FunctionName).Str("caller", fxe.CallerName).Msg("execute OnStop hook")

	case *fxevent.OnStopExecuted:
		if fxe.Err != nil {
			logger.Info().Str("callee", fxe.FunctionName).Str("caller", fxe.CallerName).Err(fxe.Err).Msg("OnStop hook failed")
			return
		}

		logger.Info().Str("callee", fxe.FunctionName).Str("caller", fxe.CallerName).Dur("runtime", fxe.Runtime).Msg("OnStop hook executed")

	case *fxevent.Supplied:
		event := logger.Info().Str("type", fxe.TypeName)

		if fxe.ModuleName != "" {
			event = event.Str("module", fxe.ModuleName)
		}

		event.Msg("supplied")

	case *fxevent.Provided:
		for _, rtype := range fxe.OutputTypeNames {
			event := logger.Info().Str("constructor", fxe.ConstructorName)

			if fxe.ModuleName != "" {
				event = event.Str("module", fxe.ModuleName)
			}

			event.Str("type", rtype).Msg("provided")
		}

		if fxe.Err != nil {
			event := logger.Err(fxe.Err)

			if fxe.ModuleName != "" {
				event = event.Str("module", fxe.ModuleName)
			}

			event.Msg("error encountered while applying options")
		}

	case *fxevent.Decorated:
		for _, rtype := range fxe.OutputTypeNames {
			event := logger.Info().Str("decorator", fxe.DecoratorName)

			if fxe.ModuleName != "" {
				event = event.Str("module", fxe.ModuleName)
			}

			event.Str("type", rtype).Msg("decorated")
		}

		if fxe.Err != nil {
			event := logger.Err(fxe.Err)

			if fxe.ModuleName != "" {
				event = event.Str("module", fxe.ModuleName)
			}

			event.Msg("error encountered while applying options")
		}

	case *fxevent.Invoking:
		// Do not log stack as it will make logs hard to read.
		event := logger.Info().Str("function", fxe.FunctionName)

		if fxe.ModuleName != "" {
			event = event.Str("module", fxe.ModuleName)
		}

		event.Msg("invoking")

	case *fxevent.Invoked:
		if fxe.Err == nil {
			return
		}

		event := logger.Err(fxe.Err).Str("stack", fxe.Trace).Str("function", fxe.FunctionName)

		if fxe.ModuleName != "" {
			event = event.Str("module", fxe.ModuleName)
		}

		event.Msg("invoke failed")

	case *fxevent.Stopping:
		logger.Info().Str("signal", strings.ToUpper(fxe.Signal.String())).Msg("received signal")

	case *fxevent.Stopped:
		if fxe.Err == nil {
			return
		}

		logger.Err(fxe.Err).Msg("stop failed")

	case *fxevent.RollingBack:
		logger.Err(fxe.StartErr).Msg("start failed, rolling back")

	case *fxevent.RolledBack:
		if fxe.Err == nil {
			return
		}

		logger.Err(fxe.Err).Msg("rollback failed")

	case *fxevent.Started:
		if fxe.Err != nil {
			logger.Err(fxe.Err).Msg("start failed")
			return
		}

		logger.Info().Msg("started")

	case *fxevent.LoggerInitialized:
		if fxe.Err != nil {
			logger.Err(fxe.Err).Msg("custom logger initialization failed")
			return
		}

		logger.Info().Str("function", fxe.ConstructorName).Msg("initialized custom fxevent.Logger")
	}
}
