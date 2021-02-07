package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	log "github.com/sirupsen/logrus"
)

var errLoginCredentialsMissing = errors.New("login credentials missing")

func main() {
	if len(os.Args) == 2 && os.Args[1] == "import" {
		err := importBookmarks()
		if err != nil {
			panic(err)
		}
		return
	}

	err := runWebServer()
	if err != nil {
		log.Errorf("error in startup: %+v", err)
		os.Exit(1)
	}
}

func runWebServer() error {
	log.Info("starting bookmarks web server")

	l, p, err := loginAndPasswordFromEnv()
	if err != nil {
		return err
	}

	i, err := newIndex()
	if err != nil {
		return err
	}
	defer i.close()

	s := newSite(l, p, i)
	r := s.newRouter()

	r.Use(handlers.RecoveryHandler(), handlers.CompressHandler)

	log.Info("starting server on port 8080")
	err = http.ListenAndServe(":8080", handlers.LoggingHandler(os.Stdout, r))
	if err != nil {
		return err
	}

	return nil
}

func loginAndPasswordFromEnv() (string, string, error) {
	l, ok := os.LookupEnv("WWW_LOGIN")
	if !ok {
		return "", "", errLoginCredentialsMissing
	}

	p, ok := os.LookupEnv("WWW_PASSWORD")
	if !ok {
		return "", "", errLoginCredentialsMissing
	}

	return l, p, nil
}

func importBookmarks() error {
	log.Info("importing bookmarks")

	i, err := newIndex()
	if err != nil {
		return err
	}
	defer i.close()

	fileInfos, err := ioutil.ReadDir("bookmarks-data")
	if err != nil {
		return err
	}

	bat := i.i.NewBatch()

	for _, fi := range fileInfos {
		b, err := ioutil.ReadFile(fmt.Sprintf("bookmarks-data/%s", fi.Name()))
		if err != nil {
			return err
		}

		d := struct {
			URL         string   `json:"url"`
			Title       string   `json:"title"`
			Description string   `json:"description"`
			Tags        []string `json:"tags"`
		}{}

		err = json.Unmarshal(b, &d)
		if err != nil {
			return err
		}

		bm := bookmark{
			URL:         d.URL,
			Title:       d.Title,
			Description: d.Description,
			Tags:        d.Tags,
		}

		_, err = saveBookmarkBatch(bm, bat)
		if err != nil {
			return err
		}
	}

	err = i.i.Batch(bat)
	if err != nil {
		return err
	}

	log.Infof("imported %d bookmarks", len(fileInfos))

	return nil
}

func equalStrings(s1 []string, s2 []string) bool {
	if len(s1) != len(s2) {
		return false
	}

	for i := range s1 {
		if s1[i] != s2[i] {
			return false
		}
	}

	return true
}
