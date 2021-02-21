package main

import (
	"context"
	"embed"
	"io/fs"
	"net/http"
	"reflect"
	"strconv"

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

//go:embed templates
var templates embed.FS

func newSite(lc fx.Lifecycle, r *mux.Router, logger *log.Logger) *site {
	s := site{
		logger: logger,
	}

	lc.Append(fx.Hook{
		OnStart: func(_ context.Context) error {
			return s.registerRoutes(r)
		},
	})

	return &s
}

func newREST(lc fx.Lifecycle, bm *bookmarks, r *mux.Router, logger *log.Logger) *rest {
	rs := rest{
		bm:     bm,
		logger: logger,
	}

	lc.Append(fx.Hook{
		OnStart: func(_ context.Context) error {
			rs.registerRoutes(r)
			return nil
		},
	})

	return &rs
}

func (s *site) registerRoutes(r *mux.Router) error {
	s.logger.Debug("registering site routes")
	t, err := fs.Sub(templates, "templates")
	if err != nil {
		return err
	}
	r.PathPrefix("/").Handler(http.FileServer(http.FS(t))).Methods(http.MethodGet, http.MethodHead)
	return nil
}

func (rs *rest) registerRoutes(r *mux.Router) {
	rs.logger.Debug("registering REST routes")
	r = r.PathPrefix("/rest/bookmarks").Subrouter()
	r.Handle("/{id:[0-9a-f]{128}}", handleRESTFunc(nil, rs.getBookmark, rs.logger)).Methods(http.MethodGet)
	r.Handle("/{id:[0-9a-f]{128}}", handleRESTFunc(nil, rs.deleteBookmark, rs.logger)).Methods(http.MethodDelete)
	r.Handle("/{id:[0-9a-f]{128}}", handleRESTFunc(reflect.TypeOf((*bookmark)(nil)), rs.updateBookmark, rs.logger)).Methods(http.MethodPut)
	r.Handle("", handleRESTFunc(nil, rs.search, rs.logger)).Methods(http.MethodGet).Queries("q", "", "requestID", "{requestID:[0-9]+}")
	r.Handle("", handleRESTFunc(reflect.TypeOf((*bookmark)(nil)), rs.createBookmark, rs.logger)).Methods(http.MethodPost)
}

func (rs *rest) search(ctx context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	q := hr.URL.Query()
	query := q.Get("q")
	reqIDStr := q.Get("requestID")

	reqID, err := strconv.ParseUint(reqIDStr, 10, 64)
	if err != nil {
		return nil, err
	}

	res, err := rs.bm.search(ctx, query)
	if err != nil {
		rs.logger.Errorf("%v", err)
		return &searchResponse{
			RequestID: reqID,
			Error:     true,
			Hits:      []hit{},
		}, nil
	}

	res.RequestID = reqID
	return res, nil
}

func (rs *rest) updateBookmark(_ context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	id := mux.Vars(hr)["id"]
	b := r.(*bookmark)
	b.ID = id
	err := rs.bm.saveBookmark(*b)
	if err != nil {
		return nil, err
	}
	return nil, nil
}

func (rs *rest) createBookmark(_ context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	b := r.(*bookmark)
	err := rs.bm.saveBookmark(*b)
	if err != nil {
		return nil, err
	}
	return nil, nil
}

func (rs *rest) deleteBookmark(_ context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	id := mux.Vars(hr)["id"]
	err := rs.bm.deleteBookmark(id)
	if err != nil {
		return nil, err
	}
	return nil, nil
}

func (rs *rest) getBookmark(ctx context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	id := mux.Vars(hr)["id"]
	b, err := rs.bm.getBookmark(ctx, id)
	if err != nil {
		return nil, err
	}
	return b, nil
}
