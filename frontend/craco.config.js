module.exports = {
  style: {
    postcss: {
      plugins: [
        require('precss'),
        require('tailwindcss'),
        require('autoprefixer')
      ]
    }
  }
}
