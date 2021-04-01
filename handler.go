package main

import (
	"crypto/sha512"
	"fmt"
	"io/fs"
	"net/http"
	"time"
)

type headersInterceptor struct {
	w http.ResponseWriter
	r *http.Request
	f headersInterceptorFunc
}

type headersInterceptorFunc func(*headersInterceptor, int) int

func (h *headersInterceptor) Header() http.Header {
	return h.w.Header()
}

func (h *headersInterceptor) Write(b []byte) (int, error) {
	return h.w.Write(b)
}

func (h *headersInterceptor) WriteHeader(statusCode int) {
	statusCode = h.f(h, statusCode)
	h.w.WriteHeader(statusCode)
}

func staticFilesHandler(f fs.FS) http.Handler {
	return http.FileServer(http.FS(f))
}

func constantLastModifiedHandler(t time.Time, next http.Handler) (http.Handler, error) {
	l, err := time.LoadLocation("GMT")
	if err != nil {
		return nil, err
	}

	ts := t.In(l).Format(time.RFC1123)

	f := func(i *headersInterceptor, statusCode int) int {
		if i.r.Method != http.MethodGet && i.r.Method != http.MethodHead {
			return statusCode
		}

		i.w.Header().Set("Last-Modified", ts)
		return statusCode
	}

	return headersInterceptorHandlerFunc(f, next), nil
}

func etagHandler(next http.Handler) http.Handler {
	f := func(i *headersInterceptor, statusCode int) int {
		if i.r.Method != http.MethodGet && i.r.Method != http.MethodHead {
			return statusCode
		}

		h := i.w.Header()
		e := i.r.RequestURI + "\n" + h.Get("Last-Modified")
		etag := `"` + fmt.Sprintf("%x", sha512.Sum512([]byte(e))) + `"`
		h.Set("ETag", etag)
		return statusCode
	}

	return headersInterceptorHandlerFunc(f, next)
}

func ifNoneMatchHandler(next http.Handler) http.Handler {
	f := func(i *headersInterceptor, statusCode int) int {
		switch {
		case statusCode == http.StatusNotModified:
			return http.StatusNotModified
		case i.r.Method != http.MethodGet && i.r.Method != http.MethodHead:
			return statusCode
		}

		etag := i.w.Header().Get("ETag")
		if etag != "" && i.r.Header.Get("If-None-Match") == etag {
			return http.StatusNotModified
		}

		return statusCode
	}

	return headersInterceptorHandlerFunc(f, next)
}

func ifModifiedSinceHandler(next http.Handler) http.Handler {
	f := func(i *headersInterceptor, statusCode int) int {
		switch {
		case statusCode == http.StatusNotModified:
			return http.StatusNotModified
		case i.r.Method != http.MethodGet && i.r.Method != http.MethodHead:
			return statusCode
		}

		ims := i.r.Header.Get("If-Modified-Since")
		lm := i.w.Header().Get("Last-Modified")
		switch {
		case ims == "", lm == "":
			return statusCode
		case ims == lm:
			return http.StatusNotModified
		}

		a, err := dateAfter(ims, lm)
		switch {
		case err != nil:
			return http.StatusInternalServerError
		case !a:
			return http.StatusNotModified
		default:
			return statusCode
		}
	}

	return headersInterceptorHandlerFunc(f, next)
}

func headersInterceptorHandlerFunc(f headersInterceptorFunc, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := headersInterceptor{
			w: w,
			r: r,
			f: f,
		}
		next.ServeHTTP(&h, r)
	})
}

func dateAfter(then string, now string) (bool, error) {
	thenT, err := time.Parse(time.RFC1123, then)
	if err != nil {
		return false, err
	}

	nowT, err := time.Parse(time.RFC1123, now)
	if err != nil {
		return false, err
	}

	return nowT.After(thenT), nil
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
