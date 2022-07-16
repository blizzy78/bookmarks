//go:build prod
// +build prod

package main

import "embed"

//go:embed frontend/build
var templates embed.FS
