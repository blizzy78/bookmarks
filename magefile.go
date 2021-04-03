//+build mage

package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"

	"github.com/magefile/mage/mg"
	"github.com/magefile/mage/sh"
)

var Default = Bookmarks

func InitDev(ctx context.Context) error {
	if err := sh.Run("npm", "install"); err != nil {
		return err
	}
	mg.CtxDeps(ctx, cssDev)
	return nil
}

// CSS builds the CSS file.
func CSS(production bool) error {
	env := map[string]string{
		"NODE_ENV": "development",
	}
	if production {
		env["NODE_ENV"] = "production"
	}
	return sh.RunWith(env, "postcss", "scss/bookmarks.scss", "-o", "templates/css/bookmarks.css")
}

func cssProd() error {
	return CSS(true)
}

func cssDev() error {
	return CSS(false)
}

// Bookmarks builds the executable.
func Bookmarks(ctx context.Context) error {
	temp, err := mvIfExists("templates/css/bookmarks.css", "")
	if err != nil {
		return err
	}

	if temp != "" {
		defer func() {
			mvIfExists(temp, "templates/css/bookmarks.css")
		}()
	}

	mg.CtxDeps(ctx, cssProd)
	defer sh.Rm("templates/css/bookmarks.css")

	return sh.Run("go", "build", "-o", "bookmarks", ".")
}

func mvIfExists(from string, to string) (string, error) {
	if mg.Verbose() {
		t := to
		if t == "" {
			t = "<temp>"
		}
		fmt.Printf("mv %s %s (if exists)\n", from, t)
	}

	copy := func() (string, error) {
		if _, err := os.Stat(from); err != nil {
			if !errors.Is(err, os.ErrNotExist) {
				return "", err
			}
			return "", nil
		}

		var f *os.File
		var err error
		if to != "" {
			f, err = os.OpenFile(to, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, os.ModePerm)
		} else {
			f, err = os.CreateTemp("", "")
		}
		if err != nil {
			return "", err
		}

		if to == "" {
			to = f.Name()
		}

		done := false
		defer func() {
			if done {
				return
			}
			sh.Rm(to)
		}()

		defer f.Close()

		if err = cp(from, f); err != nil {
			return "", err
		}

		done = true
		return to, nil
	}

	temp, err := copy()
	if err != nil {
		return "", err
	}
	if temp == "" {
		return "", nil
	}

	if err := os.Remove(from); err != nil {
		defer sh.Rm(temp)
		return "", err
	}

	return temp, nil
}

func cp(path string, w io.Writer) error {
	f, err := os.Open(path)
	if err != nil {
		return err
	}
	defer f.Close()

	_, err = io.Copy(w, f)
	return err
}
