package main

import (
	"context"
	"net/http"
	"reflect"
	"strings"

	"github.com/gorilla/mux"
	"github.com/rs/zerolog"
)

type rest struct {
	bm     *bookmarks
	router *mux.Router
	logger *zerolog.Logger
}

func newREST(bm *bookmarks, router *mux.Router, logger *zerolog.Logger) *rest {
	return &rest{
		bm:     bm,
		router: router,
		logger: componentLogger(logger, "REST"),
	}
}

func (rs *rest) start() {
	rs.registerRoutes()
}

func (rs *rest) registerRoutes() {
	rs.logger.Info().Msg("register routes")

	bmarks := rs.router.PathPrefix("/rest/bookmarks").Subrouter()
	bmarks.Handle("", handleRESTFunc(nil, rs.search, rs.logger)).Methods(http.MethodGet, http.MethodOptions).Queries("q", "")
	bmarks.Handle("/tags", handleRESTFunc(nil, rs.getAllTags, rs.logger)).Methods(http.MethodGet, http.MethodOptions)

	bmark := rs.router.PathPrefix("/rest/bookmark").Subrouter()
	bmark.Handle("", handleRESTFunc(reflect.TypeOf((*bookmark)(nil)), rs.createBookmark, rs.logger)).Methods(http.MethodPost, http.MethodOptions)
	bmark.Handle("/{id}", handleRESTFunc(nil, rs.getBookmark, rs.logger)).Methods(http.MethodGet, http.MethodOptions)
	bmark.Handle("/{id}", handleRESTFunc(nil, rs.deleteBookmark, rs.logger)).Methods(http.MethodDelete, http.MethodOptions)
	bmark.Handle("/{id}", handleRESTFunc(reflect.TypeOf((*bookmark)(nil)), rs.updateBookmark, rs.logger)).Methods(http.MethodPut, http.MethodOptions)
}

func (rs *rest) search(_ context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	q := hr.URL.Query()
	query := strings.TrimSpace(q.Get("q"))

	res, err := rs.bm.search(query)
	if err != nil {
		rs.logger.Err(err).Msg("search")

		return &searchResponse{
			Error: true,
			Hits:  []hit{},
		}, nil
	}

	return res, nil
}

func (rs *rest) updateBookmark(_ context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	b := r.(*bookmark) //nolint:forcetypeassert // type is guaranteed by registerRoutes
	b.ID = mux.Vars(hr)["id"]

	return nil, rs.bm.saveBookmark(*b)
}

func (rs *rest) createBookmark(_ context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	b := r.(*bookmark) //nolint:forcetypeassert // type is guaranteed by registerRoutes
	return nil, rs.bm.saveBookmark(*b)
}

func (rs *rest) deleteBookmark(_ context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	id := mux.Vars(hr)["id"]
	return nil, rs.bm.deleteBookmark(id)
}

func (rs *rest) getBookmark(_ context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	id := mux.Vars(hr)["id"]
	return rs.bm.getBookmark(id)
}

func (rs *rest) getAllTags(_ context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	return rs.bm.allTags()
}
