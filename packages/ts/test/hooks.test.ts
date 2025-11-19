import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { cli } from '../src/CLI'
import { captureOutput } from '../src/testing'

describe('Command Hooks', () => {
  let output: ReturnType<typeof captureOutput>

  beforeEach(() => {
    output = captureOutput()
  })

  afterEach(() => {
    output.stop()
  })

  test('before hook executes before command', async () => {
    const app = cli('test')
    const logs: string[] = []

    app
      .command('test', 'Test command')
      .before(async ({ command }) => {
        logs.push('before')
      })
      .action(() => {
        logs.push('action')
      })

    app.parse(['node', 'cli', 'test'], { run: true })
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(logs).toEqual(['before', 'action'])
  })

  test('after hook executes after command', async () => {
    const app = cli('test')
    const logs: string[] = []

    app
      .command('test', 'Test command')
      .action(() => {
        logs.push('action')
      })
      .after(async ({ command }) => {
        logs.push('after')
      })

    app.parse(['node', 'cli', 'test'], { run: true })
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(logs).toEqual(['action', 'after'])
  })

  test('middleware wraps command execution', async () => {
    const app = cli('test')
    const logs: string[] = []

    app
      .command('test', 'Test command')
      .use(async ({ next }) => {
        logs.push('middleware-before')
        await next!()
        logs.push('middleware-after')
      })
      .action(() => {
        logs.push('action')
      })

    app.parse(['node', 'cli', 'test'], { run: true })
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(logs).toEqual(['middleware-before', 'action', 'middleware-after'])
  })

  test('multiple hooks execute in order', async () => {
    const app = cli('test')
    const logs: string[] = []

    app
      .command('test', 'Test command')
      .before(() => logs.push('before1'))
      .before(() => logs.push('before2'))
      .use(async ({ next }) => {
        logs.push('middleware1-before')
        await next!()
        logs.push('middleware1-after')
      })
      .use(async ({ next }) => {
        logs.push('middleware2-before')
        await next!()
        logs.push('middleware2-after')
      })
      .action(() => logs.push('action'))
      .after(() => logs.push('after1'))
      .after(() => logs.push('after2'))

    app.parse(['node', 'cli', 'test'], { run: true })
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(logs).toEqual([
      'before1',
      'before2',
      'middleware1-before',
      'middleware2-before',
      'action',
      'middleware2-after',
      'middleware1-after',
      'after1',
      'after2',
    ])
  })

  test('hooks receive context with args and options', async () => {
    const app = cli('test')
    let capturedContext: any

    app
      .command('test <name>', 'Test command')
      .option('--verbose', 'Verbose mode')
      .before(async (context) => {
        capturedContext = context
      })
      .action(() => {})

    app.parse(['node', 'cli', 'test', 'John', '--verbose'], { run: true })
    await new Promise(resolve => setTimeout(resolve, 10))

    expect(capturedContext.args[0]).toBe('John')
    expect(capturedContext.options.verbose).toBe(true)
  })
})
