package main

import (
	"context"
	"encoding/json"
	"net/http"
	"reflect"

	"github.com/rs/zerolog"
)

type restHandler interface {
	serveREST(ctx context.Context, req any, httpReq *http.Request) (any, error)
}

type restHandlerFunc func(ctx context.Context, req any, httpReq *http.Request) (any, error)

func (f restHandlerFunc) serveREST(ctx context.Context, req any, httpReq *http.Request) (any, error) {
	return f(ctx, req, httpReq)
}

func handleREST(reqType reflect.Type, next restHandler, logger *zerolog.Logger) http.Handler { //nolint:gocognit // it's a bit more complicated
	if reqType != nil && reqType.Kind() != reflect.Ptr {
		panic("non-nil request type must be pointer")
	}

	return http.HandlerFunc(func(writer http.ResponseWriter, httpReq *http.Request) {
		header := writer.Header()

		header.Add("Cache-Control", "no-cache, no-store, must-revalidate")
		header.Add("Pragma", "no-cache")
		header.Add("Access-Control-Allow-Origin", "*")
		header.Add("Access-Control-Allow-Credentials", "true")
		header.Add("Access-Control-Allow-Methods", "OPTIONS, HEAD, GET, POST, PUT, DELETE")
		header.Add("Access-Control-Allow-Headers", "Content-Type")

		if httpReq.Method == http.MethodOptions {
			return
		}

		req := any(nil)
		if reqType != nil {
			req = reflect.New(reqType.Elem()).Interface()

			defer func() {
				_ = httpReq.Body.Close()
			}()

			if err := json.NewDecoder(httpReq.Body).Decode(req); err != nil {
				logger.Err(err).Str("requestType", reqType.Name()).Msg("unmarshal request")
				internalServerError(writer)
				return
			}
		}

		res, err := next.serveREST(httpReq.Context(), req, httpReq)
		if err != nil {
			logger.Err(err).Msg("serve REST request")
			internalServerError(writer)
			return
		}

		if res == nil {
			http.Error(writer, "No Content", http.StatusNoContent)
			return
		}

		writer.Header().Add("Content-Type", "application/json")
		if err := json.NewEncoder(writer).Encode(res); err != nil {
			logger.Err(err).Msg("send REST response")
			internalServerError(writer)
		}
	})
}

func handleRESTFunc(reqType reflect.Type, f restHandlerFunc, logger *zerolog.Logger) http.Handler {
	return handleREST(reqType, f, logger)
}

func internalServerError(w http.ResponseWriter) {
	http.Error(w, "Internal Server Error", http.StatusInternalServerError)
}
