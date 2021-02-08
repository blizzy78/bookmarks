package main

import (
	"context"
	"errors"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"go.uber.org/fx"
)

var errLoginCredentialsMissing = errors.New("login credentials missing")

type config struct {
	login    string
	password string
}

func main() {
	fxlogger := log.New()
	fxlogger.Level = log.WarnLevel

	fx.New(
		fx.Logger(fxlogger),

		fx.Provide(
			log.New,
			newConfig,
			newMux,
			newServer,
			newIndex,
			newSite,
			newREST,
		),

		fx.Invoke(func(_ *rest) {}),
		fx.Invoke(func(_ *site) {}),
		fx.Invoke(func(_ *http.Server) {}),
	).Run()
}

func newConfig() (*config, error) {
	l, ok := os.LookupEnv("WWW_LOGIN")
	if !ok {
		return nil, errLoginCredentialsMissing
	}

	p, ok := os.LookupEnv("WWW_PASSWORD")
	if !ok {
		return nil, errLoginCredentialsMissing
	}

	return &config{
		login:    l,
		password: p,
	}, nil
}

func newMux(c *config) *mux.Router {
	r := mux.NewRouter()
	r.Use(
		handlers.RecoveryHandler(),
		handlers.CompressHandler,
		authHandler(c),
	)
	return r
}

func authHandler(c *config) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return handleAuth(c, next)
	}
}

func handleAuth(c *config, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		l, p, ok := r.BasicAuth()
		if !ok {
			w.Header().Add("WWW-Authenticate", "Basic realm=\"bookmarks\"")
			unauthorized(w)
			return
		}

		if l != c.login || p != c.password {
			w.Header().Add("WWW-Authenticate", "Basic realm=\"bookmarks\"")
			unauthorized(w)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func newServer(lc fx.Lifecycle, r *mux.Router, logger *log.Logger) *http.Server {
	s := http.Server{
		Addr:    ":8080",
		Handler: handlers.LoggingHandler(logger.Writer(), r),
	}

	lc.Append(fx.Hook{
		OnStart: func(_ context.Context) error {
			logger.Info("starting web server")
			go func() {
				_ = s.ListenAndServe()
			}()
			return nil
		},

		OnStop: func(ctx context.Context) error {
			logger.Info("shutting down web server")
			return s.Shutdown(ctx)
		},
	})

	return &s
}
