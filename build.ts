import { dts } from 'bun-plugin-dtsx'

// Build the main library
await Bun.build({
  entrypoints: ['src/index.ts'],
  outdir: './dist',
  format: 'esm',
  splitting: true, // Add splitting back to reduce bundle size
  plugins: [dts()],
  target: 'node',
})

// Build the CLI binary separately
await Bun.build({
  entrypoints: ['bin/cli.ts'],
  outdir: './dist/bin',
  target: 'node',
})
