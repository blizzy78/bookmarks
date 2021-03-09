module.exports = {
	purge: [
		'./templates/index.html',
		'./templates/js/bookmarks/bookmarks.js',
		'./templates/js/tagging-*.js'
	],
	darkMode: false,
	theme: {
		extend: {},
	},
	variants: {
		extend: {},
	},
	plugins: [
		require('@tailwindcss/forms')
	],
}
