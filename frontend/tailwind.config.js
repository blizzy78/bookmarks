module.exports = {
  darkMode: 'class',
  purge: [
    './public/*.html',
    './src/*.js',
    './src/*.jsx',
    './src/*.css'
  ],
  plugins: [
    require('@tailwindcss/forms')
  ],
  variants: {
    extend: {
      filter: ['dark'],
      brightness: ['dark']
    }
  }
}
