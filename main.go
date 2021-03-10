package main

import (
	"context"
	"errors"
	"net"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"go.uber.org/fx"
)

var errLoginCredentialsMissing = errors.New("login credentials missing")

type config struct {
	login             string
	password          string
	templatesFromDisk bool
}

func main() {
	fxlogger := log.New()
	fxlogger.Level = log.WarnLevel

	logger := log.New()
	logger.Level = log.InfoLevel

	fx.New(
		fx.Logger(fxlogger),

		fx.Supply(logger),

		fx.Provide(
			newConfig,
			newMux,
			newServer,
			newBookmarks,
			newSite,
			newREST,
		),

		fx.Invoke(func(rest, site, *http.Server) {}),
	).Run()
}

func newConfig() (config, error) {
	l, ok := os.LookupEnv("WWW_LOGIN")
	if !ok {
		return config{}, errLoginCredentialsMissing
	}

	p, ok := os.LookupEnv("WWW_PASSWORD")
	if !ok {
		return config{}, errLoginCredentialsMissing
	}

	_, d := os.LookupEnv("TEMPLATES_FROM_DISK")

	return config{
		login:             l,
		password:          p,
		templatesFromDisk: d,
	}, nil
}

func newMux(c config) *mux.Router {
	r := mux.NewRouter()
	r.Use(
		handlers.RecoveryHandler(),
		handlers.CompressHandler,
		basicAuthMiddleware(c.login, c.password),
	)
	return r
}

func newServer(lc fx.Lifecycle, r *mux.Router, logger *log.Logger) *http.Server {
	s := http.Server{
		Addr:    ":8080",
		Handler: handlers.LoggingHandler(logger.Writer(), r),
	}

	lc.Append(fx.Hook{
		OnStart: func(context.Context) error {
			logger.Infof("starting web server at %s", s.Addr)

			l, err := net.Listen("tcp", s.Addr)
			if err != nil {
				return err
			}

			go func() {
				_ = s.Serve(l)
			}()

			return nil
		},

		OnStop: func(ctx context.Context) error {
			logger.Info("shutting down web server")
			ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
			defer cancel()
			return s.Shutdown(ctx)
		},
	})

	return &s
}
