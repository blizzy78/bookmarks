package main

import (
	"context"
	"crypto/sha512"
	"errors"
	"fmt"
	"time"

	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/analysis/analyzer/standard"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

type index struct {
	i bleve.Index
}

type bookmark struct {
	ID           string    `json:"-"`
	URL          string    `json:"url"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	Tags         []string  `json:"tags"`
	CreationDate time.Time `json:"creationDate"`
}

var (
	errNotFound              = errors.New("not found")
	errStringSliceConversion = errors.New("convert to string slice")
)

func newIndex() (*index, error) {
	bookmarkMapping := bleve.NewDocumentStaticMapping()
	bookmarkMapping.DefaultAnalyzer = standard.Name
	bookmarkMapping.AddFieldMappingsAt("url", bleve.NewTextFieldMapping())
	bookmarkMapping.AddFieldMappingsAt("title", bleve.NewTextFieldMapping())
	bookmarkMapping.AddFieldMappingsAt("description", bleve.NewTextFieldMapping())
	bookmarkMapping.AddFieldMappingsAt("tags", bleve.NewTextFieldMapping())
	bookmarkMapping.AddFieldMappingsAt("creationDate", bleve.NewDateTimeFieldMapping())

	indexMapping := bleve.NewIndexMapping()
	indexMapping.AddDocumentMapping("bookmark", bookmarkMapping)

	i, err := bleve.Open("bookmarks.bleve")
	if err != nil && !errors.Is(err, bleve.ErrorIndexPathDoesNotExist) {
		return nil, err
	}

	if err != nil {
		log.Info("creating new index")
		i, err = bleve.New("bookmarks.bleve", indexMapping)
	}
	if err != nil {
		return nil, err
	}

	return &index{
		i: i,
	}, nil
}

func (i *index) close() {
	_ = i.i.Close()
}

func (i *index) saveBookmark(b bookmark) error {
	id := b.ID
	if id == "" {
		id = randomID()
	}
	return i.i.Index(id, b)
}

func (i *index) getBookmark(ctx context.Context, id string) (bookmark, error) {
	q := bleve.NewDocIDQuery([]string{id})

	req := bleve.NewSearchRequest(q)
	req.Fields = []string{"url", "title", "description", "tags", "creationDate"}

	res, err := i.i.SearchInContext(ctx, req)
	if err != nil {
		return bookmark{}, err
	}

	if res.Total != 1 {
		return bookmark{}, errNotFound
	}

	h := res.Hits[0]
	return bookmark{
		ID:           id,
		URL:          h.Fields["url"].(string),
		Title:        h.Fields["title"].(string),
		Description:  h.Fields["description"].(string),
		Tags:         stringsToSlice(h.Fields["tags"]),
		CreationDate: mustParseTime(time.RFC3339, h.Fields["creationDate"].(string)),
	}, nil
}

func (i *index) deleteBookmark(id string) error {
	return i.i.Delete(id)
}

func (i *index) search(ctx context.Context, query string) (*searchResponse, error) {
	q := bleve.NewQueryStringQuery(query)

	req := bleve.NewSearchRequestOptions(q, 100, 0, false)
	req.Fields = []string{"url", "title", "description", "tags", "creationDate"}

	res, err := i.i.SearchInContext(ctx, req)
	if err != nil {
		return nil, err
	}

	hits := make([]*hit, int(res.Total))
	for i, h := range res.Hits {
		hits[i] = &hit{
			ID:           h.ID,
			URL:          h.Fields["url"].(string),
			Title:        h.Fields["title"].(string),
			Description:  h.Fields["description"].(string),
			Tags:         stringsToSlice(h.Fields["tags"]),
			CreationDate: mustParseTime(time.RFC3339, h.Fields["creationDate"].(string)),
		}
	}

	return &searchResponse{
		Hits: hits,
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

func mustParseTime(layout string, value string) time.Time {
	t, err := time.Parse(layout, value)
	if err != nil {
		panic(err)
	}
	return t
}
