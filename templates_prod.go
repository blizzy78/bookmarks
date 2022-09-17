//go:build prod
// +build prod

package main

import "embed"

//go:embed frontend/dist
var templates embed.FS
