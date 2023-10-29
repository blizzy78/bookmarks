import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',

  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      fontFamily: {
        'roboto-flex': 'var(--font-roboto-flex)',
        'roboto-condensed': 'var(--font-roboto-condensed)',
        inherit: 'inherit',
      },
    },
  },
}

export default config
