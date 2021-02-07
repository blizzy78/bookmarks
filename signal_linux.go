package main

import (
	"os"
	"syscall"
)

var termSignals = []os.Signal{os.Interrupt, os.Kill, syscall.SIGTERM, syscall.SIGQUIT}
