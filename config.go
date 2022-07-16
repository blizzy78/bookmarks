package main

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type configuration struct {
	Server  *serverConfiguration  `yaml:"server"`
	Algolia *algoliaConfiguration `yaml:"algolia"`
}

type serverConfiguration struct {
	Address string `yaml:"address"`
}

type algoliaConfiguration struct {
	AppID     string `yaml:"app-id"`
	APIKey    string `yaml:"api-key"`
	IndexName string `yaml:"index-name"`
}

func loadConfig() (*configuration, error) {
	file, err := os.Open("config.yaml")
	if err != nil {
		return nil, fmt.Errorf("open: %w", err)
	}

	config := configuration{}
	if err := yaml.NewDecoder(file).Decode(&config); err != nil {
		return nil, fmt.Errorf("decode: %w", err)
	}

	return &config, nil
}
