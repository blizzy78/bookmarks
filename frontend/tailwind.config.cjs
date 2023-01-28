/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',

  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],

  theme: {
    extend: {
      fontFamily: {
        'roboto-flex': 'Roboto Flex',
        'roboto-condensed': 'Roboto Condensed',
        inherit: 'inherit',
      },
    },
  },
}
