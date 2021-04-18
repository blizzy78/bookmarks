package main

import (
	"context"
	"net/http"
	"reflect"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"go.uber.org/fx"
)

type site struct {
	logger *log.Logger
}

type rest struct {
	bm     *bookmarks
	logger *log.Logger
}

func newSite(lc fx.Lifecycle, r *mux.Router, logger *log.Logger) site {
	s := site{
		logger: logger,
	}

	lc.Append(fx.Hook{
		OnStart: func(context.Context) error {
			return s.registerRoutes(r)
		},
	})

	return s
}

func newREST(lc fx.Lifecycle, bm *bookmarks, r *mux.Router, logger *log.Logger) rest {
	rs := rest{
		bm:     bm,
		logger: logger,
	}

	lc.Append(fx.Hook{
		OnStart: func(context.Context) error {
			rs.registerRoutes(r)
			return nil
		},
	})

	return rs
}

func (rs rest) registerRoutes(r *mux.Router) {
	rs.logger.Debug("registering REST routes")
	r = r.PathPrefix("/rest/bookmarks").Subrouter()
	r.Handle("/{id:[0-9a-f]{128}}", handleRESTFunc(nil, rs.getBookmark, rs.logger)).Methods(http.MethodGet, http.MethodOptions)
	r.Handle("/{id:[0-9a-f]{128}}", handleRESTFunc(nil, rs.deleteBookmark, rs.logger)).Methods(http.MethodDelete, http.MethodOptions)
	r.Handle("/{id:[0-9a-f]{128}}", handleRESTFunc(reflect.TypeOf((*bookmark)(nil)), rs.updateBookmark, rs.logger)).Methods(http.MethodPut, http.MethodOptions)
	r.Handle("", handleRESTFunc(nil, rs.search, rs.logger)).Methods(http.MethodGet, http.MethodOptions).Queries("q", "", "requestID", "{requestID:[0-9]+}")
	r.Handle("", handleRESTFunc(reflect.TypeOf((*bookmark)(nil)), rs.createBookmark, rs.logger)).Methods(http.MethodPost, http.MethodOptions)
}

func (rs rest) search(ctx context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	q := hr.URL.Query()
	query := strings.TrimSpace(q.Get("q"))
	reqIDStr := q.Get("requestID")

	reqID, err := strconv.ParseUint(reqIDStr, 10, 64)
	if err != nil {
		return nil, err
	}

	res, err := rs.bm.search(ctx, query)
	if err != nil {
		rs.logger.Errorf("%v", err)
		return &searchResponse{
			RequestID:   reqID,
			Error:       true,
			Hits:        []hit{},
			TopTerms:    []string{},
			TagTopTerms: []string{},
		}, nil
	}

	res.RequestID = reqID
	return res, nil
}

func (rs rest) updateBookmark(_ context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	id := mux.Vars(hr)["id"]
	b := r.(*bookmark)
	b.ID = id
	return nil, rs.bm.saveBookmark(*b)
}

func (rs rest) createBookmark(_ context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	b := r.(*bookmark)
	return nil, rs.bm.saveBookmark(*b)
}

func (rs rest) deleteBookmark(_ context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	id := mux.Vars(hr)["id"]
	return nil, rs.bm.deleteBookmark(id)
}

func (rs rest) getBookmark(ctx context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	id := mux.Vars(hr)["id"]
	return rs.bm.getBookmark(ctx, id)
}
