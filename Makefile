.PHONY: css css-prod

css:
	postcss scss/bookmarks.scss -o templates/css/bookmarks.css

css-prod:
	NODE_ENV=production postcss scss/bookmarks.scss -o templates/css/bookmarks.css
