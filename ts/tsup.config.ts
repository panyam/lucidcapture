import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['index.ts'],
  outDir: '../static/js',
  format: ['esm'],
  sourcemap: true,
  clean: true,
  target: 'es2022',
  esbuildOptions(options) {
    options.jsx = 'automatic'
    options.jsxImportSource = 'jsx-dom'
  },
})
