package main

import (
	"context"
	"net/http"
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
	bmarks.Handle("", handleRESTFunc(rs.search, rs.logger)).Methods(http.MethodGet, http.MethodOptions).Queries("q", "")
	bmarks.Handle("/tags", handleRESTFunc(rs.getAllTags, rs.logger)).Methods(http.MethodGet, http.MethodOptions)
	bmarks.Handle("/tagCounts", handleRESTFunc(rs.getAllTagCounts, rs.logger)).Methods(http.MethodGet, http.MethodOptions)

	bmark := rs.router.PathPrefix("/rest/bookmark").Subrouter()
	bmark.Handle("", handleRESTFunc(rs.createBookmark, rs.logger)).Methods(http.MethodPost, http.MethodOptions)
	bmark.Handle("/{id}", handleRESTFunc(rs.getBookmark, rs.logger)).Methods(http.MethodGet, http.MethodOptions)
	bmark.Handle("/{id}", handleRESTFunc(rs.deleteBookmark, rs.logger)).Methods(http.MethodDelete, http.MethodOptions)
	bmark.Handle("/{id}", handleRESTFunc(rs.updateBookmark, rs.logger)).Methods(http.MethodPut, http.MethodOptions)
}

func (rs *rest) search(_ context.Context, _ struct{}, hr *http.Request) (*searchResponse, error) {
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

	return &res, nil
}

func (rs *rest) updateBookmark(_ context.Context, b bookmark, hr *http.Request) (*struct{}, error) {
	b.ID = mux.Vars(hr)["id"]

	return nil, rs.bm.saveBookmark(b)
}

func (rs *rest) createBookmark(_ context.Context, b bookmark, hr *http.Request) (*struct{}, error) {
	return nil, rs.bm.saveBookmark(b)
}

func (rs *rest) deleteBookmark(_ context.Context, _ struct{}, hr *http.Request) (*struct{}, error) {
	id := mux.Vars(hr)["id"]
	return nil, rs.bm.deleteBookmark(id)
}

func (rs *rest) getBookmark(_ context.Context, _ struct{}, hr *http.Request) (*bookmark, error) {
	id := mux.Vars(hr)["id"]

	b, err := rs.bm.getBookmark(id)
	if err != nil {
		return nil, err
	}

	return &b, nil
}

func (rs *rest) getAllTags(_ context.Context, _ struct{}, hr *http.Request) ([]string, error) {
	return rs.bm.allTags()
}

func (rs *rest) getAllTagCounts(_ context.Context, _ struct{}, hr *http.Request) (map[string]int, error) {
	return rs.bm.allTagCounts()
}
