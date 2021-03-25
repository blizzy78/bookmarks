//+build mage

package main

import "github.com/magefile/mage/sh"

var Default = CSSProd

// CSS builds CSS for development.
func CSS() error {
	return buildCSS(false)
}

// CSSProd builds CSS for production.
func CSSProd() error {
	return buildCSS(true)
}

func buildCSS(prod bool) error {
	env := map[string]string{
		"NODE_ENV": "development",
	}
	if prod {
		env["NODE_ENV"] = "production"
	}
	return sh.RunWith(env, "postcss", "scss/bookmarks.scss", "-o", "templates/css/bookmarks.css")
}
