package main

import (
	"context"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/rs/zerolog"
)

type rest struct {
	bm     *bookmarks
	router *chi.Mux
	logger *zerolog.Logger
}

func newREST(bm *bookmarks, router *chi.Mux, logger *zerolog.Logger) *rest {
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

	rs.router.Route("/rest", func(restRouter chi.Router) {
		restRouter.Route("/bookmarks", func(bookmarksRouter chi.Router) {
			bookmarksRouter.Options("/", handleOptions(http.MethodGet))
			bookmarksRouter.Get("/", handleRESTFunc(rs.search, rs.logger))

			bookmarksRouter.Options("/tags", handleOptions(http.MethodGet))
			bookmarksRouter.Get("/tags", handleRESTFunc(rs.getAllTags, rs.logger))

			bookmarksRouter.Options("/tagCounts", handleOptions(http.MethodGet))
			bookmarksRouter.Get("/tagCounts", handleRESTFunc(rs.getAllTagCounts, rs.logger))
		})

		restRouter.Route("/bookmark", func(bookmarkRouter chi.Router) {
			bookmarkRouter.Options("/", handleOptions(http.MethodPost))
			bookmarkRouter.Post("/", handleRESTFunc(rs.createBookmark, rs.logger))

			bookmarkRouter.Options("/{id}", handleOptions(http.MethodGet, http.MethodDelete, http.MethodPut))
			bookmarkRouter.Get("/{id}", handleRESTFunc(rs.getBookmark, rs.logger))
			bookmarkRouter.Delete("/{id}", handleRESTFunc(rs.deleteBookmark, rs.logger))
			bookmarkRouter.Put("/{id}", handleRESTFunc(rs.updateBookmark, rs.logger))
		})
	})
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
	b.ID = chi.URLParam(hr, "id")

	return nil, rs.bm.saveBookmark(b)
}

func (rs *rest) createBookmark(_ context.Context, b bookmark, hr *http.Request) (*struct{}, error) {
	return nil, rs.bm.saveBookmark(b)
}

func (rs *rest) deleteBookmark(_ context.Context, _ struct{}, hr *http.Request) (*struct{}, error) {
	id := chi.URLParam(hr, "id")
	return nil, rs.bm.deleteBookmark(id)
}

func (rs *rest) getBookmark(_ context.Context, _ struct{}, hr *http.Request) (*bookmark, error) {
	id := chi.URLParam(hr, "id")

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
