module.exports = {
	purge: [
		'./templates/index.html',
		'./templates/js/bookmarks/*.mjs',
		'./templates/js/tagging-*.js'
	],
	plugins: [
		require('@tailwindcss/forms')
	],
}
