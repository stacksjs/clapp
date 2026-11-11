import { dts } from '@dtsx/bun'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'

export async function buildClapp(): Promise<void> {
  const cwd = import.meta.dir
  await rm(join(cwd, 'dist'), { recursive: true, force: true })
  const library = await Bun.build({
    entrypoints: [join(cwd, 'src/index.ts'), join(cwd, 'src/telemetry.ts')],
    outdir: join(cwd, 'dist'),
    format: 'esm',
    splitting: true,
    plugins: [dts({ cwd, root: './src', outdir: './dist', moduleSpecifierMode: 'node' })],
    target: 'node',
  })
  if (!library.success) throw new AggregateError(library.logs, 'Clapp library build failed')

  const cli = await Bun.build({
    entrypoints: [join(cwd, 'bin/cli.ts')],
    outdir: join(cwd, 'dist/bin'),
    target: 'node',
  })
  if (!cli.success) throw new AggregateError(cli.logs, 'Clapp CLI build failed')
}

if (import.meta.main) await buildClapp()
