import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import { createHtmlPlugin } from 'vite-plugin-html'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    eslint(),
    react(),

    createHtmlPlugin({
      minify: true,
    }),
  ],

  server: {
    port: 5173,
    strictPort: true,

    proxy: {
      '/rest': 'http://localhost:8080',
    },
  },
})
