module.exports = {
  purge: [
    './public/*.html',
    './src/*.js',
    './src/*.jsx',
    './src/*.css'
  ],
  plugins: [
    require('@tailwindcss/forms')
  ]
}
