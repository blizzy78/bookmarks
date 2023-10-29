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

func LintBackend() error {
	if err := sh.Run("go", "run", "github.com/golangci/golangci-lint/cmd/golangci-lint@latest", "run", "-c", ".golangci.yml"); err != nil {
		return fmt.Errorf("go run golangci-lint: %w", err)
	}

	if err := sh.Run("go", "run", "github.com/blizzy78/consistent/cmd/consistent@latest", "./..."); err != nil {
		return fmt.Errorf("go run consistent: %w", err)
	}

	return nil
}

func LintFrontend() error {
	return doDir("./frontend", func() error {
		if err := sh.Run("pnpm", "install"); err != nil {
			return fmt.Errorf("pnpm install: %w", err)
		}

		if err := sh.Run("pnpm", "lint"); err != nil {
			return fmt.Errorf("pnpm lint: %w", err)
		}

		return nil
	})
}

func Backend(ctx context.Context) error {
	mg.CtxDeps(ctx, LintBackend)

	env := map[string]string{
		"CGO_ENABLED": "0",
	}

	if err := sh.RunWith(env, "go", "build", "-o", "bookmarks", "."); err != nil {
		return fmt.Errorf("go build: %w", err)
	}

	return nil
}

func Frontend(ctx context.Context) error {
	mg.CtxDeps(ctx, LintFrontend)

	return doDir("./frontend", func() error {
		if err := sh.Run("pnpm", "install"); err != nil {
			return fmt.Errorf("pnpm install: %w", err)
		}

		if err := sh.Run("pnpm", "build", "--no-lint"); err != nil {
			return fmt.Errorf("pnpm build: %w", err)
		}

		return nil
	})
}

func DockerBackend(ctx context.Context) error {
	mg.CtxDeps(ctx, Backend)

	if err := sh.Run("docker", "build", "-f", "Dockerfile", "-t", "bookmarks-backend:latest", "--progress", "plain", "."); err != nil {
		return fmt.Errorf("docker build: %w", err)
	}

	if err := sh.Run("docker", "save", "-o", "bookmarks-backend.docker.tar", "bookmarks-backend:latest"); err != nil {
		return fmt.Errorf("docker save: %w", err)
	}

	return nil
}

func DockerFrontend(ctx context.Context) error {
	mg.CtxDeps(ctx, Frontend)

	if err := sh.Run("docker", "build", "-f", "./frontend/Dockerfile", "-t", "bookmarks-frontend:latest", "--progress", "plain", "./frontend"); err != nil {
		return fmt.Errorf("docker build: %w", err)
	}

	if err := sh.Run("docker", "save", "-o", "bookmarks-frontend.docker.tar", "bookmarks-frontend:latest"); err != nil {
		return fmt.Errorf("docker save: %w", err)
	}

	return nil
}

func Deploy(ctx context.Context) error { //nolint:deadcode // mage uses this
	mg.SerialCtxDeps(ctx, DockerBackend, DockerFrontend)

	if err := sh.Run("scp", "-C", "bookmarks-backend.docker.tar", "bookmarks-frontend.docker.tar", "mickey@blizzy.de:"); err != nil {
		return fmt.Errorf("scp: %w", err)
	}

	if err := sh.Run("ssh", "mickey@blizzy.de", "/home/mickey/update-bookmarks.sh"); err != nil {
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
