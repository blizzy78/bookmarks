//go:build mage
// +build mage

package main

import (
	"context"
	"os"

	"github.com/magefile/mage/mg"
	"github.com/magefile/mage/sh"
)

var Default = Bookmarks

func InitDev() error {
	wd, err := os.Getwd()
	if err != nil {
		return err
	}

	if err := os.Chdir(wd + "/frontend"); err != nil {
		return err
	}
	defer os.Chdir(wd)

	return sh.Run("npm", "install")
}

// Frontend builds the web frontend.
func Frontend(ctx context.Context) error {
	mg.CtxDeps(ctx, InitDev)

	wd, err := os.Getwd()
	if err != nil {
		return err
	}

	if err := os.Chdir(wd + "/frontend"); err != nil {
		return err
	}
	defer os.Chdir(wd)

	return sh.Run("npm", "run", "build")
}

// Bookmarks builds the backend executable.
func Bookmarks(ctx context.Context) error {
	mg.CtxDeps(ctx, Frontend)

	return sh.Run("go", "build", "-o", "bookmarks", "-tags", "prod", ".")
}
