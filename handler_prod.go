//go:build prod
// +build prod

package main

import (
	"io/fs"
	"net/http"
)

func staticFilesHandler(f fs.FS) http.Handler {
	return http.FileServer(http.FS(f))
}

func cacheControlHandler(cc string, next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, httpReq *http.Request) {
		if httpReq.Method != http.MethodGet {
			next.ServeHTTP(writer, httpReq)
			return
		}

		writer.Header().Add("Cache-Control", cc)
		next.ServeHTTP(writer, httpReq)
	})
}
