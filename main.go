package main

import (
	"net/http"
	"os"

	"github.com/gorilla/handlers"
	log "github.com/sirupsen/logrus"
)

func main() {
	log.Info("bookmarks starting")

	err := func() error {
		i, err := newIndex()
		if err != nil {
			return err
		}
		defer i.close()

		s := newSite(i)
		r := s.newRouter()

		r.Use(handlers.RecoveryHandler(), handlers.CompressHandler)

		log.Info("starting server on port 8080")
		err = http.ListenAndServe(":8080", handlers.LoggingHandler(os.Stdout, r))
		if err != nil {
			return err
		}

		return nil
	}()

	if err != nil {
		log.Errorf("error in startup: %+v", err)
		os.Exit(1)
	}
}
