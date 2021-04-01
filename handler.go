package main

import (
	"io/fs"
	"net/http"
)

func staticFilesHandler(f fs.FS) http.Handler {
	return http.FileServer(http.FS(f))
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
