package main

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"reflect"

	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
	"go.uber.org/fx"
)

type site struct {
	logger *log.Logger
}

type rest struct {
	i      *index
	logger *log.Logger
}

type searchRequest struct {
	RequestID int    `json:"requestId"`
	Query     string `json:"q"`
}

type searchResponse struct {
	RequestID int    `json:"requestId"`
	Hits      []*hit `json:"hits"`
}

type hit struct {
	ID          string   `json:"id"`
	URL         string   `json:"url"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
}

type saveBookmarkRequest struct {
	ID          string   `json:"id"`
	URL         string   `json:"url"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
}

type deleteBookmarkRequest struct {
	ID string `json:"id"`
}

type restHandler interface {
	serveREST(ctx context.Context, r interface{}, hr *http.Request) (interface{}, error)
}

type restHandlerFunc func(ctx context.Context, r interface{}, hr *http.Request) (interface{}, error)

type restRouter struct {
	*mux.Router
}

func newSite(lc fx.Lifecycle, r *mux.Router, logger *log.Logger) *site {
	s := site{
		logger: logger,
	}

	lc.Append(fx.Hook{
		OnStart: func(_ context.Context) error {
			s.registerRoutes(r)
			return nil
		},
	})

	return &s
}

func newREST(lc fx.Lifecycle, i *index, r *mux.Router, logger *log.Logger) *rest {
	rs := rest{
		i:      i,
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

func (s *site) registerRoutes(r *mux.Router) {
	s.logger.Debug("registering site routes")
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("templates"))).Methods(http.MethodGet, http.MethodHead)
}

func (rs *rest) registerRoutes(r *mux.Router) {
	rs.logger.Debug("registering REST routes")
	rr := restRouter{
		Router: r.PathPrefix("/rest").Subrouter(),
	}
	rr.handleRESTFunc(http.MethodGet, "/bookmark/{id:[0-9a-f]{128}}", nil, rs.getBookmark)
	rr.handleRESTFunc(http.MethodPost, "/search", reflect.TypeOf((*searchRequest)(nil)), rs.search)
	rr.handleRESTFunc(http.MethodPost, "/saveBookmark", reflect.TypeOf((*saveBookmarkRequest)(nil)), rs.saveBookmark)
	rr.handleRESTFunc(http.MethodPost, "/deleteBookmark", reflect.TypeOf((*deleteBookmarkRequest)(nil)), rs.deleteBookmark)
}

func (rs *rest) search(ctx context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	req := r.(*searchRequest)

	res, err := rs.i.search(ctx, req.Query)
	if err != nil {
		return nil, err
	}

	res.RequestID = req.RequestID
	return res, nil
}

func (rs *rest) saveBookmark(ctx context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	req := r.(*saveBookmarkRequest)

	b := bookmark{
		ID:          req.ID,
		URL:         req.URL,
		Title:       req.Title,
		Description: req.Description,
		Tags:        req.Tags,
	}

	_, err := rs.i.saveBookmark(b)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (rs *rest) deleteBookmark(ctx context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	req := r.(*deleteBookmarkRequest)

	err := rs.i.deleteBookmark(req.ID)
	if err != nil {
		return nil, err
	}

	return nil, nil
}

func (rs *rest) getBookmark(ctx context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	id := mux.Vars(hr)["id"]

	b, err := rs.i.getBookmark(ctx, id)
	if err != nil {
		return nil, err
	}

	return b, nil
}

func (r restRouter) handleREST(m string, path string, rt reflect.Type, h restHandler) {
	r.Handle(path, handleREST(rt, h)).Methods(m)
}

func (r restRouter) handleRESTFunc(m string, path string, rt reflect.Type, f restHandlerFunc) {
	r.handleREST(m, path, rt, f)
}

func (f restHandlerFunc) serveREST(ctx context.Context, r interface{}, hr *http.Request) (interface{}, error) {
	return f(ctx, r, hr)
}

func handleREST(rt reflect.Type, next restHandler) http.Handler {
	if rt != nil && rt.Kind() != reflect.Ptr {
		panic("type must be pointer")
	}

	return http.HandlerFunc(func(w http.ResponseWriter, hr *http.Request) {
		var r interface{}
		if rt != nil {
			r = reflect.New(rt.Elem()).Interface()
			err := unmarshalJSONRequestBody(r, hr)
			if err != nil {
				internalServerError(w)
				return
			}
		}

		res, err := next.serveREST(hr.Context(), r, hr)
		if err != nil {
			internalServerError(w)
			return
		}

		if res == nil {
			noContent(w)
			return
		}

		err = sendJSON(w, res)
		if err != nil {
			internalServerError(w)
		}
	})
}

func unmarshalJSONRequestBody(v interface{}, r *http.Request) error {
	defer r.Body.Close()

	b, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return err
	}

	return json.Unmarshal(b, v)
}

func sendJSON(w http.ResponseWriter, v interface{}) error {
	b, err := json.Marshal(v)
	if err != nil {
		return err
	}

	w.Header().Add("Content-Type", "application/json")
	_, err = w.Write(b)
	if err != nil {
		return err
	}

	return nil
}

func internalServerError(w http.ResponseWriter) {
	http.Error(w, "Internal Server Error", http.StatusInternalServerError)
}

func noContent(w http.ResponseWriter) {
	http.Error(w, "No Content", http.StatusNoContent)
}

func unauthorized(w http.ResponseWriter) {
	http.Error(w, "Unauthorized", http.StatusUnauthorized)
}
