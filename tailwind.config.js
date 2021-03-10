module.exports = {
	purge: [
		'./templates/index.html',
		'./templates/js/bookmarks/*.mjs',
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
