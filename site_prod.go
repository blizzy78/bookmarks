//+build prod

package main

import (
	"crypto/sha512"
	"fmt"
	"io/fs"
	"net/http"
	"time"

	"github.com/blizzy78/conditional-http/handler"
	"github.com/gorilla/mux"
)

func (s site) registerRoutes(r *mux.Router) error {
	s.logger.Debug("registering site routes")

	t, err := fs.Sub(templates, "frontend/build")
	if err != nil {
		return err
	}

	h := staticFilesHandler(t)
	h = cacheControlHandler("public, max-age=3600", h)

	h, err = handler.LastModifiedHandlerConstant(time.Now(), h)
	if err != nil {
		return err
	}

	h = handler.ETagHandler(
		func(w http.ResponseWriter, r *http.Request) (handler.ETag, bool) {
			u := r.RequestURI
			l := w.Header().Get("Last-Modified")
			t := u + "\n" + l
			return handler.ETag{
				Tag:  fmt.Sprintf("%x", sha512.Sum512([]byte(t))),
				Weak: true,
			}, true
		},
		handler.AfterHeaders, h)

	h = handler.IfNoneMatchIfModifiedSinceHandler(true, h)

	r.PathPrefix("").Handler(http.StripPrefix("/", h)).Methods(http.MethodGet, http.MethodHead)

	return nil
}
