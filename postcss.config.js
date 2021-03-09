module.exports = {
	plugins: {
		precss: {},
		tailwindcss: {},
		autoprefixer: {},
		cssnano: require('cssnano')({
            preset: 'default',
        })
	}
}
