import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { cli } from '../src'
import { ClappError } from '../src/utils'

/**
 * Covers the `exitOnError` / `cli.run()` convenience that makes clapp
 * handle its own usage errors instead of every downstream CLI needing a
 * try/catch around `parse()`.
 *
 * We stub `process.exit` + `process.stderr.write` so the tests don't
 * actually terminate the runner.
 */

interface Captured {
  exitCode: number | null
  stderr: string
}

function captureProcess(): { captured: Captured, restore: () => void } {
  const originalExit = process.exit
  const originalWrite = process.stderr.write.bind(process.stderr)
  const captured: Captured = { exitCode: null, stderr: '' }
  ;(process as unknown as { exit: (code?: number) => never }).exit = (code = 0): never => {
    captured.exitCode = code
    // Throw a tagged symbol so the caller can unwind — `process.exit` is
    // `never` in type, but under the stub we need to escape the caller.
    throw new Error(`__test_exit__:${code}`)
  }
  ;(process.stderr as unknown as { write: (chunk: string) => boolean }).write = (chunk: string): boolean => {
    captured.stderr += chunk
    return true
  }
  return {
    captured,
    restore: () => {
      ;(process as unknown as { exit: (code?: number) => never }).exit = originalExit
      ;(process.stderr as unknown as { write: typeof originalWrite }).write = originalWrite
    },
  }
}

describe('ClappError metadata', () => {
  it('marks itself as a usage error with exitCode 2', () => {
    const err = new ClappError('boom')
    expect(err.isUsageError).toBe(true)
    expect(err.exitCode).toBe(2)
  })
})

describe('parse({ exitOnError: true })', () => {
  let ctx: ReturnType<typeof captureProcess>
  beforeEach(() => { ctx = captureProcess() })
  afterEach(() => { ctx.restore() })

  it('prints a friendly message + calls process.exit for unknown options', async () => {
    const app = cli('demo')
    app.command('build', 'Build the project')
      .option('--verbose', 'verbose')
      .action(() => {})

    await expect(async () => {
      await app.parse(['node', 'demo', 'build', '--verbos'], { exitOnError: true })
    }).toThrow('__test_exit__:2')

    expect(ctx.captured.exitCode).toBe(2)
    expect(ctx.captured.stderr).toContain('Unknown option')
    expect(ctx.captured.stderr).toContain('--help')
    // The friendly message must NOT show a stack trace.
    expect(ctx.captured.stderr).not.toContain('at runMatchedCommand')
  })

  it('prefixes the message with the CLI name when set', async () => {
    const app = cli('demo')
    app.command('build').option('--verbose').action(() => {})

    await expect(async () => {
      await app.parse(['node', 'demo', 'build', '--wrong'], { exitOnError: true })
    }).toThrow(/__test_exit__/)

    expect(ctx.captured.stderr.startsWith('demo:')).toBe(true)
  })

  it('does NOT exit for non-usage errors — they still propagate', async () => {
    const app = cli('demo')
    app.command('boom').action(() => {
      throw new Error('internal failure')
    })

    try {
      await app.parse(['node', 'demo', 'boom'], { exitOnError: true })
      throw new Error('should have thrown')
    }
    catch (err) {
      expect((err as Error).message).toBe('internal failure')
    }
    expect(ctx.captured.exitCode).toBeNull()
  })
})

describe('cli.run()', () => {
  let ctx: ReturnType<typeof captureProcess>
  beforeEach(() => { ctx = captureProcess() })
  afterEach(() => { ctx.restore() })

  it('is a thin shorthand for parse({ exitOnError: true })', async () => {
    const app = cli('demo')
    app.command('build').option('--verbose').action(() => {})

    await expect(async () => {
      await app.run(['node', 'demo', 'build', '--wrong'])
    }).toThrow(/__test_exit__/)

    expect(ctx.captured.exitCode).toBe(2)
    expect(ctx.captured.stderr).toContain('Unknown option')
  })
})
