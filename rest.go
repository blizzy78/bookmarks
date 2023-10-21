package main

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"reflect"
	"strings"
)

type restHandlerFunc[Req any, Res any] func(ctx context.Context, req Req, httpReq *http.Request) (Res, error)

func handleRESTFunc[Req any, Res any](fun restHandlerFunc[Req, Res], logger *slog.Logger) http.HandlerFunc {
	var reqCheck Req
	if reflect.TypeOf(reqCheck).Kind() == reflect.Ptr {
		panic("request type must not be pointer")
	}

	return func(writer http.ResponseWriter, httpReq *http.Request) {
		header := writer.Header()
		header.Add("Cache-Control", "no-cache, no-store, must-revalidate")
		header.Add("Pragma", "no-cache")

		var req Req

		switch any(req).(type) {
		case nil, struct{}:

		default:
			defer func() {
				_ = httpReq.Body.Close()
			}()

			if err := json.NewDecoder(httpReq.Body).Decode(&req); err != nil {
				logger.Error("unmarshal request", slog.String("requestType", reflect.TypeOf(req).Name()))
				internalServerError(writer)

				return
			}
		}

		res, err := fun(httpReq.Context(), req, httpReq)

		if err != nil {
			var httpErr *httpError
			if errors.As(err, &httpErr) {
				http.Error(writer, httpErr.message, httpErr.code)
				return
			}

			logger.Error("serve REST request", slog.Any("err", err))
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
			logger.Error("send REST response", slog.Any("err", err))
			internalServerError(writer)
		}
	}
}

func handleOptions(allowedMethods ...string) http.HandlerFunc {
	return func(writer http.ResponseWriter, httpReq *http.Request) {
		allowedMethods = append(allowedMethods, http.MethodOptions)

		header := writer.Header()
		header.Add("Access-Control-Allow-Origin", "*")
		header.Add("Access-Control-Allow-Credentials", "true")
		header.Add("Access-Control-Allow-Methods", strings.Join(allowedMethods, ", "))
		header.Add("Access-Control-Allow-Headers", "Content-Type")

		http.Error(writer, "No Content", http.StatusNoContent)
	}
}

func internalServerError(w http.ResponseWriter) {
	http.Error(w, "Internal Server Error", http.StatusInternalServerError)
}
