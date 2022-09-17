/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',

  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html'
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
