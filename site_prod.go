//go:build prod
// +build prod

package main

import (
	"crypto/sha512"
	"fmt"
	"io/fs"
	"net/http"
	"time"

	"github.com/blizzy78/conditional-http/handler"
)

func (site *site) start() error {
	return site.registerRoutes()
}

func (site *site) registerRoutes() error {
	site.logger.Info("register routes")

	templ, err := fs.Sub(templates, "frontend/dist")
	if err != nil {
		return fmt.Errorf("sub frontend/dist: %w", err)
	}

	hand := staticFilesHandler(templ)
	hand = cacheControlHandler("public, max-age=2592000", hand)

	hand, err = handler.LastModifiedHandlerConstant(time.Now(), hand)
	if err != nil {
		return fmt.Errorf("last-mod handler: %w", err)
	}

	hand = handler.ETagHandler(
		func(w http.ResponseWriter, r *http.Request) (handler.ETag, bool) {
			u := r.RequestURI
			l := w.Header().Get("Last-Modified")

			tag := u + "\n" + l

			return handler.ETag{
				Tag:  fmt.Sprintf("%x", sha512.Sum512([]byte(tag))),
				Weak: true,
			}, true
		},

		handler.AfterHeaders, hand,
	)

	hand = handler.IfNoneMatchIfModifiedSinceHandler(true, hand)

	hand = http.StripPrefix("/", hand)

	site.router.Mount("/", hand)

	return nil
}
