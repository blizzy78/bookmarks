package main

import (
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/algolia/algoliasearch-client-go/v3/algolia/opt"
	"github.com/algolia/algoliasearch-client-go/v3/algolia/search"
	"github.com/rs/zerolog"
)

type bookmarks struct {
	i *search.Index
}

type bookmark struct {
	ID          string   `json:"objectID"`
	URL         string   `json:"url"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []string `json:"tags,omitempty"`
}

type searchResponse struct {
	Error bool  `json:"error"`
	Hits  []hit `json:"hits"`
}

type hit struct {
	ID              string   `json:"id"`
	URL             string   `json:"url"`
	URLHTML         string   `json:"urlHTML"`
	TitleHTML       string   `json:"titleHTML"`
	DescriptionHTML string   `json:"descriptionHTML"`
	Tags            []string `json:"tags,omitempty"`
}

var errStringSliceConversion = errors.New("convert to string slice")

func newBookmarks(config *configuration, logger *zerolog.Logger) *bookmarks {
	logger = componentLogger(logger, "bookmarks")

	logger.Info().Str("appID", config.Algolia.AppID).Str("index", config.Algolia.IndexName).Msg("use Algolia")

	client := search.NewClient(config.Algolia.AppID, config.Algolia.APIKey)
	index := client.InitIndex(config.Algolia.IndexName)

	bm := bookmarks{
		i: index,
	}

	return &bm
}

func (bm *bookmarks) saveBookmark(b bookmark) error {
	res, err := bm.i.SaveObject(b)
	if err != nil {
		return fmt.Errorf("save: %w", err)
	}

	if err = res.Wait(); err != nil {
		return fmt.Errorf("wait: %w", err)
	}

	return nil
}

func (bm *bookmarks) getBookmark(id string) (bookmark, error) {
	bookm := bookmark{}

	if err := bm.i.GetObject(id, &bookm); err != nil {
		return bookmark{}, fmt.Errorf("get: %w", err)
	}

	return bookm, nil
}

func (bm *bookmarks) deleteBookmark(id string) error {
	res, err := bm.i.DeleteObject(id)
	if err != nil {
		return fmt.Errorf("delete: %w", err)
	}

	if err = res.Wait(); err != nil {
		return fmt.Errorf("wait: %w", err)
	}

	return nil
}

func (bm *bookmarks) search(query string) (searchResponse, error) {
	res, err := bm.i.Search(query, opt.HitsPerPage(30))
	if err != nil {
		return searchResponse{
			Error: true,
		}, fmt.Errorf("search: %w", err)
	}

	searchRes := searchResponse{
		Hits: make([]hit, len(res.Hits)),
	}

	for i, hit := range res.Hits {
		searchRes.Hits[i] = matchToHit(hit)
	}

	return searchRes, nil
}

func (bm *bookmarks) allTags() ([]string, error) {
	res, err := bm.i.Search("", opt.AttributesToRetrieve("tags"), opt.HitsPerPage(1000000))
	if err != nil {
		return nil, fmt.Errorf("search: %w", err)
	}

	tagsUnique := map[string]struct{}{}

	for _, hit := range res.Hits {
		tags := stringsToSlice(hit["tags"])

		for _, tag := range tags {
			if _, ok := tagsUnique[tag]; ok {
				continue
			}

			tagsUnique[tag] = struct{}{}
		}
	}

	tags := make([]string, 0, len(tagsUnique))
	for tag := range tagsUnique {
		tags = append(tags, tag)
	}

	sort.Strings(tags)

	return tags, nil
}

func matchToHit(match map[string]interface{}) hit {
	id := match["objectID"].(string) //nolint:forcetypeassert // we know it's a string

	url := match["url"].(string) //nolint:forcetypeassert // we know it's a string

	urlHTML := highlightedValue(match, "url").(string) //nolint:forcetypeassert // we know it's a string
	urlHTML = strings.TrimPrefix(urlHTML, "http://")
	urlHTML = strings.TrimPrefix(urlHTML, "https://")

	titleHTML := highlightedValue(match, "title").(string) //nolint:forcetypeassert // we know it's a string

	descriptionHTML := highlightedValue(match, "description").(string) //nolint:forcetypeassert // we know it's a string

	tags := stringsToSlice(match["tags"])

	return hit{
		ID:              id,
		URL:             url,
		URLHTML:         urlHTML,
		TitleHTML:       titleHTML,
		DescriptionHTML: descriptionHTML,
		Tags:            tags,
	}
}

func highlightedValue(match map[string]interface{}, key string) interface{} {
	highlighted, ok := match["_highlightResult"].(map[string]interface{})
	if !ok {
		return match[key]
	}

	entry, ok := highlighted[key].(map[string]interface{})
	if !ok {
		return match[key]
	}

	return entry["value"]
}

func stringsToSlice(value interface{}) []string {
	if value == nil {
		return []string{}
	}

	switch sValue := value.(type) {
	case []string:
		return sValue

	case []interface{}:
		res := make([]string, len(sValue))
		for i, v := range sValue {
			res[i] = v.(string) //nolint:forcetypeassert // we know it's a string
		}

		return res

	default:
		panic(errStringSliceConversion)
	}
}
