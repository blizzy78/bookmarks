.PHONY: clean

templates/css/bookmarks.css: scss/*
	postcss scss/bookmarks.scss -o templates/css/bookmarks.css
