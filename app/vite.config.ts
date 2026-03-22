import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // GitHub Pages serves from /lucidcapture/ — only set base for production build
  base: command === 'build' ? '/lucidcapture/' : '/',
}))
