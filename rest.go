package main

import (
	"context"
	"encoding/json"
	"net/http"
	"reflect"

	log "github.com/sirupsen/logrus"
)

type restHandler interface {
	serveREST(ctx context.Context, req interface{}, httpReq *http.Request) (interface{}, error)
}

type restHandlerFunc func(ctx context.Context, req interface{}, httpReq *http.Request) (interface{}, error)

func (f restHandlerFunc) serveREST(ctx context.Context, req interface{}, httpReq *http.Request) (interface{}, error) {
	return f(ctx, req, httpReq)
}

func handleREST(reqType reflect.Type, next restHandler, logger *log.Logger) http.Handler {
	if reqType != nil && reqType.Kind() != reflect.Ptr {
		panic("non-nil request type must be pointer")
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		req := interface{}(nil)
		if reqType != nil {
			req = reflect.New(reqType.Elem()).Interface()
			defer r.Body.Close()
			err := json.NewDecoder(r.Body).Decode(req)
			if err != nil {
				logger.Errorf("error unmarshaling request of type: %s: %v", reqType.Name(), err)
				internalServerError(w)
				return
			}
		}

		h := w.Header()
		h.Add("Cache-Control", "no-cache, no-store, must-revalidate")
		h.Add("Pragma", "no-cache")

		res, err := next.serveREST(r.Context(), req, r)
		if err != nil {
			logger.Errorf("error serving REST request: %v", err)
			internalServerError(w)
			return
		}

		if res == nil {
			http.Error(w, "No Content", http.StatusNoContent)
			return
		}

		w.Header().Add("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(res); err != nil {
			logger.Errorf("error sending REST response: %v", err)
			internalServerError(w)
		}
	})
}

func handleRESTFunc(reqType reflect.Type, f restHandlerFunc, logger *log.Logger) http.Handler {
	return handleREST(reqType, f, logger)
}

func internalServerError(w http.ResponseWriter) {
	http.Error(w, "Internal Server Error", http.StatusInternalServerError)
}
