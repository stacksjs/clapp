import { dts } from 'bun-plugin-dtsx'

// Build the main library
await Bun.build({
  entrypoints: ['src/index.ts', 'src/telemetry.ts'],
  outdir: './dist',
  format: 'esm',
  plugins: [dts()],
  target: 'node',
})

// Build the CLI binary separately
await Bun.build({
  entrypoints: ['bin/cli.ts'],
  outdir: './dist/bin',
  target: 'node',
})
