package main

import (
	"net/http"

	"github.com/gorilla/mux"
)

func basicAuthMiddleware(login string, password string) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return basicAuthHandler(login, password, next)
	}
}

func basicAuthHandler(login string, password string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		l, p, ok := r.BasicAuth()
		if !ok {
			w.Header().Add("WWW-Authenticate", "Basic realm=\"bookmarks\"")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		if l != login || p != password {
			w.Header().Add("WWW-Authenticate", "Basic realm=\"bookmarks\"")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func cacheControlMiddleware(cc string) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return cacheControlHandler(cc, next)
	}
}

func cacheControlHandler(cc string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			next.ServeHTTP(w, r)
			return
		}

		w.Header().Add("Cache-Control", cc)
		next.ServeHTTP(w, r)
	})
}
