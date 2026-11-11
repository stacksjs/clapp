import { expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

// Build the owning package explicitly. Supplied archives never trigger builds.
test('the installed prompt SDK preserves its public types and testing implementation', async () => {
  const directory = await mkdtemp(join(process.env.CLAPP_PACKAGE_EVIDENCE ?? tmpdir(), 'clapp-package-'))
  const consumer = join(directory, 'consumer')
  const archive = join(directory, 'package.tgz')
  const commands: Array<Record<string, unknown>> = []
  const receipt: Record<string, unknown> = { directory, commands, completed: false }
  const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
  async function run(phase: string, args: string[], cwd: string) {
    const env: Record<string, string | undefined> = { ...process.env, DO_NOT_TRACK: '1', NO_TELEMETRY: '1' }
    for (const key of Object.keys(env)) if (/token|password|secret|private_key|^npm_config_|^bun_auth_/i.test(key)) delete env[key]
    const child = Bun.spawn(args, { cwd, env, stdout: 'pipe', stderr: 'pipe', timeout: 120_000 })
    const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
    const output = stdout + stderr
    const log = `${commands.length}-${phase}.log`
    await writeFile(join(directory, log), output)
    commands.push({ phase, args, cwd, code, log, diagnostics: [...output.matchAll(/error TS(\d+)/g)].map(match => Number(match[1])) })
    return { code, output }
  }
  try {
    const supplied = process.env.CLAPP_PACKAGE_ARCHIVE
    if (supplied) {
      receipt.archiveInput = resolve(supplied)
      await copyFile(resolve(supplied), archive)
    }
    else {
      const packed = await run('pack', [process.execPath, '--no-env-file', 'pm', 'pack', '--filename', archive], resolve(import.meta.dir, '..'))
      expect(packed.code, packed.output).toBe(0)
    }
    const bytes = await readFile(archive)
    receipt.archiveSHA256 = hash(bytes)
    const files = await new Bun.Archive(bytes).files()
    const manifest = await files.get('package/package.json')!.json()
    expect(manifest.name).toBe('@stacksjs/clapp')
    receipt.version = manifest.version
    await mkdir(consumer)
    const consumerManifest = { private: true, type: 'module', dependencies: { '@stacksjs/clapp': `file:${archive}` }, devDependencies: { typescript: '7.0.2', '@types/bun': '1.4.4' } }
    receipt.consumerManifest = consumerManifest
    await writeFile(join(consumer, 'package.json'), JSON.stringify(consumerManifest))
    const prefix = `import { autocomplete, telemetry } from '@stacksjs/clapp';
import type { AutocompleteOptions, TestContext } from '@stacksjs/clapp';
import { telemetry as directTelemetry } from '@stacksjs/clapp/telemetry';
declare const context: TestContext;
type StaticOptions = Extract<AutocompleteOptions<string>['options'], readonly unknown[]>;
declare const option: StaticOptions[number];
type IsAny<T> = 0 extends (1 & T) ? true : false;`
    const controls = [
      { text: `const options: AutocompleteOptions<string> = { message: 'Select', options: [{ label: 'One', value: 'one' }], signal: new AbortController().signal };
const value: string = option.value;
const signal: AbortSignal | undefined = options.signal;
const stdout: string[] = context.stdout.buffer;
const same: typeof telemetry = directTelemetry;
const safeValue: false = null as unknown as IsAny<typeof option.value>;
const safeBuffer: false = null as unknown as IsAny<typeof context.stdout.buffer>;
const safeTelemetry: false = null as unknown as IsAny<typeof telemetry>;
void autocomplete;` },
      { code: 2322, text: "const bad: AutocompleteOptions<string> = { message: 'Select', options: [{ label: 'Number', value: 42 }] }" },
      { code: 2322, text: 'const wrong: number = context.stdout.buffer[0]' },
      { code: 2445, text: 'const hidden = context.stdin._buffer' },
      { code: 2339, text: 'const phantom = telemetry.notAPublicMetric' },
    ]
    const nativeCLI = supplied ? process.env.CLAPP_NATIVE_CLI : resolve(import.meta.dir, '../../../bin/clapp')
    if (!supplied) expect(nativeCLI).toBeDefined()
    if (nativeCLI) receipt.nativeCLI = { path: resolve(nativeCLI), sha256: hash(await readFile(nativeCLI)) }
    let lockSHA256: string | undefined
    for (const flags of [[], ['--frozen-lockfile']]) {
      const phase = flags.length ? 'frozen' : 'normal'
      const installed = await run(`${phase}-install`, [process.execPath, '--no-env-file', 'install', '--registry=https://registry.npmjs.org', ...flags], consumer)
      expect(installed.code, installed.output).toBe(0)
      const lock = hash(await readFile(join(consumer, 'bun.lock')))
      if (lockSHA256) expect(lock).toBe(lockSHA256)
      else { lockSHA256 = lock; receipt.lockSHA256 = lock }
      for (const [name, file] of files) {
        expect(name.startsWith('package/') && !name.split('/').includes('..')).toBe(true)
        const installed = await readFile(join(consumer, 'node_modules/@stacksjs/clapp', name.slice('package/'.length)))
        expect(hash(installed), name).toBe(hash(new Uint8Array(await file.arrayBuffer())))
      }
      const compiler = await Bun.file(join(consumer, 'node_modules/typescript/package.json')).json()
      expect(compiler.version).toBe('7.0.2')
      for (const mode of ['Bundler', 'NodeNext'] as const) {
        const compilerOptions = { target: 'ESNext', module: mode === 'NodeNext' ? 'NodeNext' : 'ESNext', moduleResolution: mode, strict: true, skipLibCheck: false, paths: {}, types: ['bun'], noEmit: true }
        await writeFile(join(consumer, 'tsconfig.json'), JSON.stringify({ compilerOptions, files: ['control.ts'] }))
        for (const [index, control] of controls.entries()) {
          await writeFile(join(consumer, 'control.ts'), `${prefix}\n${control.text}\n`)
          const checked = await run(`${phase}-${mode}-${index}`, [process.execPath, '--no-env-file', join(consumer, 'node_modules/typescript/lib/tsc.js'), '--project', 'tsconfig.json'], consumer)
          expect(checked.code === 0, checked.output).toBe(index === 0)
          if ('code' in control) {
            expect(checked.output.match(/error TS\d+/g), checked.output).toEqual([`error TS${control.code}`])
            expect(checked.output).toContain('control.ts(')
          }
        }
      }
      await writeFile(join(consumer, 'runtime.js'), `import * as api from '@stacksjs/clapp';
import { telemetry } from '@stacksjs/clapp/telemetry';
if (api.telemetry !== telemetry) throw new Error('public exports do not share telemetry identity');
const context = api.setupTest();
try {
  process.stdout.write('captured');
  context.stdin.pushValue('entered');
  if (context.stdout.buffer.join('') !== 'captured' || String(context.stdin.read()) !== 'entered') throw new Error('published test streams are broken');
} finally { api.teardownTest(context); }
const cli = api.createTestCLI({ name: 'installed-sdk' });
cli.command('greet <name>').action(name => { console.log('Hello ' + name); });
const result = await api.execCommand(cli, ['greet', 'friend']);
if (result.exitCode !== 0 || result.stdout.trim() !== 'Hello friend' || result.stderr !== '') throw new Error('installed command execution failed: ' + JSON.stringify(result));
console.log('PASS installed prompt SDK');`)
      const runtime = await run(`${phase}-runtime`, [process.execPath, '--no-env-file', 'runtime.js'], consumer)
      expect(runtime.code, runtime.output).toBe(0)
      expect(runtime.output.trim()).toBe('PASS installed prompt SDK')
      const cli = await run(`${phase}-cli-help`, [process.execPath, '--no-env-file', join(consumer, 'node_modules/@stacksjs/clapp/dist/bin/cli.js'), '--help'], consumer)
      expect(cli.code, cli.output).toBe(0)
      expect(cli.output).toMatch(/usage/i)
      if (nativeCLI) {
        const native = await run(`${phase}-native-cli-help`, [resolve(nativeCLI), '--help'], consumer)
        expect(native.code, native.output).toBe(0)
        expect(native.output).toMatch(/usage/i)
      }
    }
    receipt.completed = true
  }
  finally {
    await writeFile(join(directory, 'receipt.json'), JSON.stringify(receipt, null, 2))
    await rm(join(consumer, 'node_modules'), { recursive: true, force: true })
    if (!process.env.CLAPP_PACKAGE_EVIDENCE) await rm(directory, { recursive: true, force: true })
  }
}, 180_000)
