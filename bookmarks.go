package main

import (
	"context"
	"crypto/sha512"
	"errors"
	"fmt"
	"html"
	"sort"
	"strings"

	"github.com/blevesearch/bleve/v2"
	"github.com/blevesearch/bleve/v2/mapping"
	"github.com/blevesearch/bleve/v2/search"
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
	RequestID   uint64   `json:"requestID"`
	TotalHits   uint64   `json:"totalHits"`
	Error       bool     `json:"error"`
	Hits        []hit    `json:"hits"`
	TopTerms    []string `json:"topTerms"`
	TagTopTerms []string `json:"tagTopTerms"`
}

type hit struct {
	ID              string   `json:"id"`
	URL             string   `json:"url"`
	URLHTML         string   `json:"urlHTML"`
	TitleHTML       string   `json:"titleHTML"`
	DescriptionHTML string   `json:"descriptionHTML"`
	Tags            []string `json:"tags"`
}

type searchError struct {
	err error
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
	bookmarkMapping.DefaultAnalyzer = "standard"
	bookmarkMapping.AddFieldMappingsAt("url", bleve.NewTextFieldMapping())
	bookmarkMapping.AddFieldMappingsAt("title", bleve.NewTextFieldMapping())
	bookmarkMapping.AddFieldMappingsAt("description", bleve.NewTextFieldMapping())
	bookmarkMapping.AddFieldMappingsAt("tags", bleve.NewTextFieldMapping())

	im := bleve.NewIndexMapping()
	im.AddDocumentMapping("bookmark", bookmarkMapping)

	return im
}

func (bm *bookmarks) openIndex(context.Context) error {
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

func (bm *bookmarks) closeIndex(context.Context) error {
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

func (bm *bookmarks) search(ctx context.Context, query string) (searchResponse, error) {
	q := bleve.NewQueryStringQuery(query)

	req := bleve.NewSearchRequestOptions(q, 100, 0, false)
	req.Fields = []string{"url", "title", "description", "tags"}
	req.Highlight = bleve.NewHighlightWithStyle("html")

	res, err := bm.i.SearchInContext(ctx, req)
	if err != nil {
		return searchResponse{}, &searchError{
			err: err,
		}
	}

	hits := make([]hit, len(res.Hits))
	for i, m := range res.Hits {
		hits[i] = matchToHit(m)
	}

	last := query
	i := strings.LastIndex(query, " ")
	if i >= 0 {
		last = query[i:]
	}

	dictEntries, tagDictEntries, err := bm.topTerms(last)
	if err != nil {
		return searchResponse{}, &searchError{
			err: err,
		}
	}

	return searchResponse{
		TotalHits:   res.Total,
		Hits:        hits,
		TopTerms:    dictEntries,
		TagTopTerms: tagDictEntries,
	}, nil
}

func (bm *bookmarks) topTerms(prefix string) ([]string, []string, error) {
	entries, err := topTerms(bm.i, []string{"title", "description"}, prefix, 5)
	if err != nil {
		return nil, nil, err
	}

	tagEntries, err := topTerms(bm.i, []string{"tags"}, prefix, 5)
	if err != nil {
		return nil, nil, err
	}

	return entries, tagEntries, nil
}

func (b bookmark) Type() string {
	return "bookmark"
}

func matchToHit(m *search.DocumentMatch) hit {
	url := m.Fields["url"].(string)
	urlHTML := html.EscapeString(url)
	if u, ok := m.Fragments["url"]; ok {
		urlHTML = u[0]
	}

	titleHTML := html.EscapeString(m.Fields["title"].(string))
	if t, ok := m.Fragments["title"]; ok {
		titleHTML = t[0]
	}

	descriptionHTML := html.EscapeString(m.Fields["description"].(string))
	if d, ok := m.Fragments["description"]; ok {
		descriptionHTML = d[0]
	}

	return hit{
		ID:              m.ID,
		URL:             url,
		URLHTML:         urlHTML,
		TitleHTML:       titleHTML,
		DescriptionHTML: descriptionHTML,
		Tags:            stringsToSlice(m.Fields["tags"]),
	}
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

func (s searchError) Error() string {
	return fmt.Sprintf("search: %v", s.err)
}

func topTerms(i bleve.Index, fields []string, prefix string, count int) ([]string, error) {
	entries, err := dictEntries(i, fields, prefix)
	if err != nil {
		return nil, err
	}

	terms := make([]string, len(entries))
	idx := 0
	for t := range entries {
		terms[idx] = t
		idx++
	}

	sort.SliceStable(terms, func(a, b int) bool {
		t1 := terms[a]
		t2 := terms[b]
		c1 := entries[t1]
		c2 := entries[t2]
		// reversed
		return c2 < c1
	})

	m := len(terms)
	if m > count {
		m = count
	}
	return terms[:m], nil
}

func dictEntries(i bleve.Index, fields []string, prefix string) (map[string]uint64, error) {
	entries := map[string]uint64{}
	for _, f := range fields {
		d, err := i.FieldDictPrefix(f, []byte(prefix))
		if err != nil {
			return nil, err
		}
		defer d.Close()

		for {
			de, err := d.Next()
			if err != nil {
				return nil, err
			}
			if de == nil {
				break
			}

			if c, ok := entries[de.Term]; ok {
				entries[de.Term] = c + de.Count
				continue
			}

			entries[de.Term] = de.Count
		}
	}
	return entries, nil
}
