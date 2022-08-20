/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',

  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/*.html'
  ],

  theme: {
    extend: {
      fontFamily: {
        copy: ['Lato']
      }
    }
  },

  corePlugins: {
    preflight: false
  }
}
