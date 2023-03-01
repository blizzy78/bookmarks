//go:build mage
// +build mage

package main

import (
	"context"
	"fmt"
	"os"

	"github.com/magefile/mage/mg"
	"github.com/magefile/mage/sh"
)

var Default = Deploy

// Frontend builds the web frontend.
func Frontend(ctx context.Context) error {
	return doDir("./frontend", func() error {
		if err := sh.Run("npm", "install", "--no-funds"); err != nil {
			return fmt.Errorf("npm install: %w", err)
		}

		if err := sh.Run("npm", "run", "build"); err != nil {
			return fmt.Errorf("npm run build: %w", err)
		}

		return nil
	})
}

// Lint runs linters.
func Lint() error {
	if err := sh.Run("go", "run", "github.com/golangci/golangci-lint/cmd/golangci-lint@latest", "run", "-c", ".golangci.yml"); err != nil {
		return fmt.Errorf("go run golangci-lint: %w", err)
	}

	if err := sh.Run("go", "run", "github.com/blizzy78/consistent/cmd/consistent@latest", "./..."); err != nil {
		return fmt.Errorf("go run consistent: %w", err)
	}

	return nil
}

// Build builds the backend executable.
func Build(ctx context.Context) error {
	mg.SerialCtxDeps(ctx, Lint, Frontend)

	env := map[string]string{
		"CGO_ENABLED": "0",
	}

	if err := sh.RunWith(env, "go", "build", "-o", "bookmarks", "-tags", "prod", "."); err != nil {
		return fmt.Errorf("go build: %w", err)
	}

	return nil
}

// Deploy updates the live server with a new build of the application.
func Deploy(ctx context.Context) error { //nolint:deadcode // mage uses this
	mg.CtxDeps(ctx, Build)

	if err := sh.Run("scp", "-C", "bookmarks", "mickey@blizzy.de:"); err != nil {
		return fmt.Errorf("scp: %w", err)
	}

	if err := sh.Run("ssh", "mickey@blizzy.de", "/opt/bookmarks/update.sh", "/home/mickey/bookmarks"); err != nil {
		return fmt.Errorf("ssh update: %w", err)
	}

	return nil
}

func doDir(path string, fun func() error) error {
	chdirBack, err := chdir(path)
	if err != nil {
		return fmt.Errorf("chdir: %w", err)
	}

	defer chdirBack()

	if err := fun(); err != nil {
		return fmt.Errorf("execute function: %w", err)
	}

	return nil
}

func chdir(path string) (func(), error) {
	wd, err := os.Getwd()
	if err != nil {
		return func() {}, fmt.Errorf("getwd: %w", err)
	}

	if err := os.Chdir(path); err != nil {
		return func() {}, fmt.Errorf("%s: chdir: %w", path, err)
	}

	return func() {
		_ = os.Chdir(wd)
	}, nil
}
