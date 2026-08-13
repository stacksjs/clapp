import { describe, expect, it } from 'bun:test'
import { cli } from '../src'
import { ClappError, isClappError } from '../src/utils'

/**
 * Regression tests for the parser bugs behind stacksjs/stacks#2003 and
 * stacksjs/stacks#1988:
 *
 * 1. Dashed global flags (`--dry-run`, `--no-interaction`, `--no-emoji`,
 *    `--no-cache`) must be accepted when declared, must parse as
 *    booleans, and must actually enable their CLI modes.
 * 2. "Colon is optional": `buddy make model` must dispatch to the
 *    registered `make:model` command when no bare `make` command exists,
 *    while an exactly-named command still wins over the joined form.
 * 3. Usage errors must keep a stable, well-defined shape so callers can
 *    render message + usage without a stack trace.
 */

describe('dashed global flags', () => {
  it('accepts --dry-run when declared globally and enables dry-run mode', async () => {
    const app = cli('buddy')
    app.dryRun()

    let received: Record<string, unknown> | undefined
    app
      .command('list', 'List commands')
      .action((options: Record<string, unknown>) => {
        received = options
      })

    await app.parse(['node', 'buddy', 'list', '--dry-run'], { run: true })

    expect(app.isDryRun).toBe(true)
    expect(received?.dryRun).toBe(true)
  })

  it('parses a dashed boolean flag as boolean even when a positional follows', async () => {
    const app = cli('buddy')

    let receivedEnv: unknown
    let receivedOptions: Record<string, unknown> | undefined
    app
      .command('deploy [env]', 'Deploy')
      .option('--git-commit', 'Commit before deploying', { default: false })
      .action((env: unknown, options: Record<string, unknown>) => {
        receivedEnv = env
        receivedOptions = options
      })

    await app.parse(['node', 'buddy', 'deploy', '--git-commit', 'production'], { run: true })

    // `--git-commit` must not swallow `production` as its value
    expect(receivedEnv).toBe('production')
    expect(receivedOptions?.gitCommit).toBe(true)
  })

  it('accepts a dashed flag declared with a short alias', async () => {
    const app = cli('buddy')

    let received: Record<string, unknown> | undefined
    app
      .command('changelog', 'Generate changelog')
      .option('-d, --dry-run', 'Preview changes', { default: false })
      .action((options: Record<string, unknown>) => {
        received = options
      })

    await app.parse(['node', 'buddy', 'changelog', '--dry-run'], { run: true })

    expect(received?.dryRun).toBe(true)
    expect(received?.d).toBe(true)
  })

  it('enables no-interaction mode when --no-interaction is passed', async () => {
    const app = cli('buddy')
    app.noInteraction()

    app.command('list', 'List commands').action(() => {})

    await app.parse(['node', 'buddy', 'list', '--no-interaction'], { run: true })

    expect(app.isNoInteraction).toBe(true)
  })

  it('disables emoji output when --no-emoji is passed', async () => {
    const app = cli('buddy')
    app.emoji()

    app.command('list', 'List commands').action(() => {})

    await app.parse(['node', 'buddy', 'list', '--no-emoji'], { run: true })

    expect(app.useEmoji).toBe(false)
  })

  it('disables caching when --no-cache is passed', async () => {
    const app = cli('buddy')
    app.cache()

    app.command('list', 'List commands').action(() => {})

    await app.parse(['node', 'buddy', 'list', '--no-cache'], { run: true })

    expect(app.isNoCache).toBe(true)
  })

  it('keeps defaults when negated flags are not passed', async () => {
    const app = cli('buddy')
    app.noInteraction()
    app.emoji()
    app.cache()

    app.command('list', 'List commands').action(() => {})

    await app.parse(['node', 'buddy', 'list'], { run: true })

    expect(app.isNoInteraction).toBe(false)
    expect(app.useEmoji).toBe(true)
    expect(app.isNoCache).toBe(false)
  })

  it('still rejects genuinely unknown options', async () => {
    const app = cli('buddy')
    app.dryRun()

    app.command('list', 'List commands').action(() => {})

    let caught: unknown
    try {
      await app.parse(['node', 'buddy', 'list', '--nope'], { run: true })
    }
    catch (err) {
      caught = err
    }

    expect(isClappError(caught)).toBe(true)
    expect((caught as ClappError).message).toContain('Unknown option `--nope`')
  })
})

describe('colon-optional command invocation', () => {
  it('dispatches the joined argv[0]:argv[1] command and consumes both tokens', async () => {
    const app = cli('buddy')

    let ran = ''
    let receivedName: unknown
    app
      .command('make:model <name>', 'Create a model')
      .action((name: unknown) => {
        ran = 'make:model'
        receivedName = name
      })

    await app.parse(['node', 'buddy', 'make', 'model', 'Post'], { run: true })

    expect(ran).toBe('make:model')
    expect(receivedName).toBe('Post')
    // Both `make` and `model` tokens are consumed; only `Post` remains
    expect([...app.args]).toEqual(['Post'])
    expect(app.matchedCommandName).toBe('make:model')
  })

  it('parses options for the joined command', async () => {
    const app = cli('buddy')

    let received: Record<string, unknown> | undefined
    app
      .command('make:model <name>', 'Create a model')
      .option('--dry-run', 'Preview the files', { default: false })
      .action((_name: unknown, options: Record<string, unknown>) => {
        received = options
      })

    await app.parse(['node', 'buddy', 'make', 'model', 'Post', '--dry-run'], { run: true })

    expect(received?.dryRun).toBe(true)
    expect([...app.args]).toEqual(['Post'])
  })

  it('prefers an exactly-named command over the joined form', async () => {
    const app = cli('buddy')

    let ran = ''
    app.command('migrate', 'Run migrations').action(() => {
      ran = 'migrate'
    })
    app.command('migrate:fresh', 'Fresh migrations').action(() => {
      ran = 'migrate:fresh'
    })

    await app.parse(['node', 'buddy', 'migrate', 'fresh'], { run: true })

    expect(ran).toBe('migrate')
    expect(app.matchedCommandName).toBe('migrate')
  })

  it('dispatches the joined form when only the colon command exists', async () => {
    const app = cli('buddy')

    let ran = ''
    app.command('migrate:fresh', 'Fresh migrations').action(() => {
      ran = 'migrate:fresh'
    })

    await app.parse(['node', 'buddy', 'migrate', 'fresh'], { run: true })

    expect(ran).toBe('migrate:fresh')
    expect(app.matchedCommandName).toBe('migrate:fresh')
    expect([...app.args]).toEqual([])
  })

  it('does not join across a flag token', async () => {
    const app = cli('buddy')

    let ran = ''
    app.command('make:model', 'Create a model').action(() => {
      ran = 'make:model'
    })
    // Suppress the "command not found" exit path; we only assert that
    // no joined dispatch happened.
    app.on('command:*', () => {})

    // `--force` starts with `-`, so no joined match may be attempted
    await app.parse(['node', 'buddy', 'make', '--force'], { run: false })

    expect(ran).toBe('')
    expect(app.matchedCommand).toBeUndefined()
  })
})

describe('ClappError shape', () => {
  it('keeps its stable usage-error shape', () => {
    const err = new ClappError('boom')

    expect(err.name).toBe('ClappError')
    expect(err.message).toBe('boom')
    expect(err.exitCode).toBe(2)
    expect(err.isUsageError).toBe(true)
    expect(err.usage).toBeUndefined()
    expect(err.format()).toBe('boom')
    expect(err instanceof Error).toBe(true)
  })

  it('carries an optional usage line', () => {
    const err = new ClappError('boom', '$ buddy upgrade [options]')

    expect(err.usage).toBe('$ buddy upgrade [options]')
    expect(err.format()).toBe('boom')
  })

  it('isClappError matches real and duck-typed instances only', () => {
    expect(isClappError(new ClappError('boom'))).toBe(true)
    // Cross-instance shape (e.g. a duplicated @stacksjs/clapp copy)
    expect(isClappError({ name: 'ClappError', message: 'boom' })).toBe(true)
    expect(isClappError(new Error('boom'))).toBe(false)
    expect(isClappError({ name: 'OtherError', message: 'boom' })).toBe(false)
    expect(isClappError(undefined)).toBe(false)
    expect(isClappError(null)).toBe(false)
    expect(isClappError('ClappError')).toBe(false)
  })

  it('unknown-option errors thrown by parse() carry the command usage line', async () => {
    const app = cli('buddy')

    app
      .command('upgrade', 'Upgrade the framework')
      .option('--dry-run', 'Preview actions', { default: false })
      .action(() => {})

    let caught: unknown
    try {
      await app.parse(['node', 'buddy', 'upgrade', '--nope'], { run: true })
    }
    catch (err) {
      caught = err
    }

    expect(isClappError(caught)).toBe(true)
    const err = caught as ClappError
    expect(err.message).toContain('Unknown option')
    expect(err.usage).toBe('$ buddy upgrade')
    expect(err.exitCode).toBe(2)
    expect(err.isUsageError).toBe(true)
  })

  it('missing-argument errors thrown by parse() carry the command usage line', async () => {
    const app = cli('buddy')

    app
      .command('deploy <environment>', 'Deploy the app')
      .action(() => {})

    let caught: unknown
    try {
      await app.parse(['node', 'buddy', 'deploy'], { run: true })
    }
    catch (err) {
      caught = err
    }

    expect(isClappError(caught)).toBe(true)
    const err = caught as ClappError
    expect(err.message).toContain('Missing required argument')
    expect(err.usage).toBe('$ buddy deploy <environment>')
  })
})

describe('repeated flags', () => {
  it('collects a flag given more than once', async () => {
    const app = cli('ts-sftp')

    let received: Record<string, unknown> | undefined
    app
      .command('serve', 'Serve files')
      .option('--user <entry>', 'A user, repeatable')
      .action((options: Record<string, unknown>) => {
        received = options
      })

    await app.parse(['bun', 'ts-sftp', 'serve', '--user', 'a:1', '--user', 'b:2', '--user', 'c:3'], { run: true })
    expect(received?.user).toEqual(['a:1', 'b:2', 'c:3'])
  })

  it('leaves a flag given once as a scalar', async () => {
    const app = cli('ts-sftp')

    let received: Record<string, unknown> | undefined
    app
      .command('serve', 'Serve files')
      .option('--user <entry>', 'A user, repeatable')
      .action((options: Record<string, unknown>) => {
        received = options
      })

    await app.parse(['bun', 'ts-sftp', 'serve', '--user', 'only:1'], { run: true })
    expect(received?.user).toBe('only:1')
  })

  it('collects --key=value spellings too', async () => {
    const app = cli('app')

    let received: Record<string, unknown> | undefined
    app
      .command('run', 'Run')
      .option('--env <pair>', 'Environment pair')
      .action((options: Record<string, unknown>) => {
        received = options
      })

    await app.parse(['bun', 'app', 'run', '--env=A=1', '--env=B=2'], { run: true })
    expect(received?.env).toEqual(['A=1', 'B=2'])
  })

  it('keeps a repeated boolean a boolean', async () => {
    const app = cli('app')

    let received: Record<string, unknown> | undefined
    app
      .command('run', 'Run')
      .option('--verbose', 'Talk more')
      .action((options: Record<string, unknown>) => {
        received = options
      })

    await app.parse(['bun', 'app', 'run', '--verbose', '--verbose'], { run: true })
    expect(received?.verbose).toBe(true)
  })

  it('collects through an alias without double-counting it', async () => {
    const app = cli('app')

    let received: Record<string, unknown> | undefined
    app
      .command('run', 'Run')
      .option('-u, --user <entry>', 'A user, repeatable')
      .action((options: Record<string, unknown>) => {
        received = options
      })

    await app.parse(['bun', 'app', 'run', '-u', 'a', '--user', 'b'], { run: true })
    expect(received?.user).toEqual(['a', 'b'])
    expect(received?.u).toEqual(['a', 'b'])
  })
})
