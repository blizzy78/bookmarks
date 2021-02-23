package main

import (
	"context"
	"errors"
	"net"
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

	return config{
		login:    l,
		password: p,
	}, nil
}

func newMux(c config) *mux.Router {
	r := mux.NewRouter()
	r.Use(
		handlers.RecoveryHandler(),
		handlers.CompressHandler,
		basicAuthHandler(c.login, c.password),
	)
	return r
}

func basicAuthHandler(login string, password string) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return handleBasicAuth(login, password, next)
	}
}

func handleBasicAuth(login string, password string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		l, p, ok := r.BasicAuth()
		if !ok {
			w.Header().Add("WWW-Authenticate", "Basic realm=\"bookmarks\"")
			unauthorized(w)
			return
		}

		if l != login || p != password {
			w.Header().Add("WWW-Authenticate", "Basic realm=\"bookmarks\"")
			unauthorized(w)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func unauthorized(w http.ResponseWriter) {
	http.Error(w, "Unauthorized", http.StatusUnauthorized)
}

func newServer(lc fx.Lifecycle, r *mux.Router, logger *log.Logger) *http.Server {
	s := http.Server{
		Addr:    ":8080",
		Handler: handlers.LoggingHandler(logger.Writer(), r),
	}

	lc.Append(fx.Hook{
		OnStart: func(context.Context) error {
			logger.Info("starting web server")

			l, err := net.Listen("tcp", s.Addr)
			if err != nil {
				return err
			}

			go func() {
				defer l.Close()
				_ = s.Serve(l)
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
