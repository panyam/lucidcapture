import * as esbuild from 'esbuild'

const watch = process.argv.includes('--watch')
const prod = process.argv.includes('--prod')

const defaultHost = prod
  ? 'https://lucidcapture.appspot.com'
  : 'http://localhost:5173'

console.log(`Building for ${prod ? 'production' : 'development'} (default host: ${defaultHost})`)

const config = {
  entryPoints: {
    background: 'src/background.ts',
    content: 'src/content.ts',
    'popup/popup': 'src/popup/popup.ts',
  },
  bundle: true,
  outdir: 'dist',
  format: 'iife',
  target: 'chrome120',
  sourcemap: true,
  define: {
    '__DEFAULT_APP_HOST__': JSON.stringify(defaultHost),
  },
}

if (watch) {
  const ctx = await esbuild.context(config)
  await ctx.watch()
  console.log('Watching for changes...')
} else {
  await esbuild.build(config)
  console.log('Build complete → dist/')
}
