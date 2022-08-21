package main

import (
	"context"
	"encoding/json"
	"net/http"
	"reflect"

	"github.com/rs/zerolog"
)

type restHandlerFunc[Req any, Res any] func(ctx context.Context, req Req, httpReq *http.Request) (Res, error)

func handleRESTFunc[Req any, Res any](fun restHandlerFunc[Req, Res], logger *zerolog.Logger) http.Handler {
	var reqCheck Req
	if reflect.TypeOf(reqCheck).Kind() == reflect.Ptr {
		panic("request type must not be pointer")
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

		var req Req

		switch any(req).(type) {
		case nil, struct{}:

		default:
			defer func() {
				_ = httpReq.Body.Close()
			}()

			if err := json.NewDecoder(httpReq.Body).Decode(&req); err != nil {
				logger.Err(err).Str("requestType", reflect.TypeOf(req).Name()).Msg("unmarshal request")
				internalServerError(writer)
				return
			}
		}

		res, err := fun(httpReq.Context(), req, httpReq)
		if err != nil {
			logger.Err(err).Msg("serve REST request")
			internalServerError(writer)
			return
		}

		switch any(res).(type) {
		case nil, struct{}, *struct{}:
			http.Error(writer, "No Content", http.StatusNoContent)
			return

		default:
		}

		writer.Header().Add("Content-Type", "application/json")
		if err := json.NewEncoder(writer).Encode(res); err != nil {
			logger.Err(err).Msg("send REST response")
			internalServerError(writer)
		}
	})
}

func internalServerError(w http.ResponseWriter) {
	http.Error(w, "Internal Server Error", http.StatusInternalServerError)
}
