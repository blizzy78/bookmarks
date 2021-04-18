module.exports = {
  purge: [
    './public/*.html',
    './src/*.jsx',
    './src/*.css'
  ],
  plugins: [
    require('@tailwindcss/forms')
  ]
}
