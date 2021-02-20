package main

import (
	"context"
	"crypto/sha512"
	"errors"
	"fmt"

	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/analysis/analyzer/standard"
	"github.com/blevesearch/bleve/v2/mapping"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
	"go.uber.org/fx"
)

type bookmarks struct {
	i      bleve.Index
	logger *log.Logger
}

type bookmark struct {
	ID          string   `json:"-"`
	URL         string   `json:"url"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
}

type searchResponse struct {
	RequestID uint64 `json:"requestID"`
	TotalHits uint64 `json:"totalHits"`
	Hits      []*hit `json:"hits"`
}

type hit struct {
	ID          string   `json:"id"`
	URL         string   `json:"url"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
}

var (
	errNotFound              = errors.New("not found")
	errStringSliceConversion = errors.New("convert to string slice")
)

func newBookmarks(lc fx.Lifecycle, logger *log.Logger) (*bookmarks, error) {
	bm := bookmarks{
		logger: logger,
	}

	lc.Append(fx.Hook{
		OnStart: bm.openIndex,
		OnStop:  bm.closeIndex,
	})

	return &bm, nil
}

func newIndexMapping() mapping.IndexMapping {
	bookmarkMapping := bleve.NewDocumentStaticMapping()
	bookmarkMapping.DefaultAnalyzer = standard.Name
	bookmarkMapping.AddFieldMappingsAt("url", bleve.NewTextFieldMapping())
	bookmarkMapping.AddFieldMappingsAt("title", bleve.NewTextFieldMapping())
	bookmarkMapping.AddFieldMappingsAt("description", bleve.NewTextFieldMapping())
	bookmarkMapping.AddFieldMappingsAt("tags", bleve.NewTextFieldMapping())

	im := bleve.NewIndexMapping()
	im.AddDocumentMapping("bookmark", bookmarkMapping)

	return im
}

func (bm *bookmarks) openIndex(_ context.Context) error {
	var err error

	bm.logger.Debug("opening index")
	bm.i, err = bleve.Open("bookmarks.bleve")

	if err != nil && errors.Is(err, bleve.ErrorIndexPathDoesNotExist) {
		bm.logger.Debug("creating new index")
		m := newIndexMapping()
		bm.i, err = bleve.New("bookmarks.bleve", m)
	}

	if err != nil {
		return err
	}

	return nil
}

func (bm *bookmarks) closeIndex(_ context.Context) error {
	bm.logger.Debug("closing index")
	return bm.i.Close()
}

func (bm *bookmarks) saveBookmark(b bookmark) error {
	id := b.ID
	if id == "" {
		id = randomID()
	}
	return bm.i.Index(id, b)
}

func (bm *bookmarks) getBookmark(ctx context.Context, id string) (bookmark, error) {
	q := bleve.NewDocIDQuery([]string{id})

	req := bleve.NewSearchRequest(q)
	req.Fields = []string{"url", "title", "description", "tags"}

	res, err := bm.i.SearchInContext(ctx, req)
	if err != nil {
		return bookmark{}, err
	}

	if res.Total != 1 {
		return bookmark{}, errNotFound
	}

	h := res.Hits[0]
	return bookmark{
		ID:          id,
		URL:         h.Fields["url"].(string),
		Title:       h.Fields["title"].(string),
		Description: h.Fields["description"].(string),
		Tags:        stringsToSlice(h.Fields["tags"]),
	}, nil
}

func (bm *bookmarks) deleteBookmark(id string) error {
	return bm.i.Delete(id)
}

func (bm *bookmarks) search(ctx context.Context, query string) (*searchResponse, error) {
	q := bleve.NewQueryStringQuery(query)

	req := bleve.NewSearchRequestOptions(q, 100, 0, false)
	req.Fields = []string{"url", "title", "description", "tags"}

	res, err := bm.i.SearchInContext(ctx, req)
	if err != nil {
		return nil, err
	}

	hits := make([]*hit, len(res.Hits))
	for i, h := range res.Hits {
		hits[i] = &hit{
			ID:          h.ID,
			URL:         h.Fields["url"].(string),
			Title:       h.Fields["title"].(string),
			Description: h.Fields["description"].(string),
			Tags:        stringsToSlice(h.Fields["tags"]),
		}
	}

	return &searchResponse{
		TotalHits: res.Total,
		Hits:      hits,
	}, nil
}

func (b bookmark) Type() string {
	return "bookmark"
}

func randomID() string {
	uuid, err := uuid.NewRandom()
	if err != nil {
		panic(err)
	}
	return fmt.Sprintf("%x", sha512.Sum512([]byte(uuid.String())))
}

func stringsToSlice(v interface{}) []string {
	if v == nil {
		return []string{}
	}

	switch sv := v.(type) {
	case string:
		return []string{sv}
	case []string:
		return sv
	case []interface{}:
		r := make([]string, len(sv))
		for i, se := range sv {
			r[i] = se.(string)
		}
		return r
	default:
		panic(errStringSliceConversion)
	}
}
