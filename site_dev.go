//go:build !prod
// +build !prod

package main

import "github.com/gorilla/mux"

func (s site) registerRoutes(r *mux.Router) error {
	return nil
}
