package main

import (
	"errors"
	"net/http"

	"github.com/algolia/algoliasearch-client-go/v3/algolia/errs"
)

type httpError struct {
	message string
	code    int
}

func httpErrFrom(err error) error {
	if err == nil {
		return nil
	}

	var aErr *errs.AlgoliaErr
	if errors.As(err, &aErr) && aErr.Status == http.StatusNotFound {
		return &httpError{
			message: "Not Found",
			code:    http.StatusNotFound,
		}
	}

	return &httpError{
		message: "Internal Server Error",
		code:    http.StatusInternalServerError,
	}
}

func (e *httpError) Error() string {
	return e.message
}
