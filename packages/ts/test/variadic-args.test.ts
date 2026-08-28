import { describe, expect, it } from 'bun:test'
import { cli } from '../src'
import { findAllBrackets } from '../src/utils'

/**
 * Both spellings of a variadic argument work.
 *
 * `findAllBrackets` recognised only the LEADING form (`[...files]`). The
 * trailing one (`[files...]`) - the spelling most CLI documentation uses, and
 * the one people reach for first - parsed as an ordinary argument named
 * "files...", so the command ran with `variadic: false`, the action received
 * `args[0]`, and every argument after the first was dropped without a word:
 *
 *     mycli check a.ts b.ts c.ts
 *
 * checked a.ts, printed a clean result, and never mentioned b.ts or c.ts. A
 * checker wired into CI that way passes for the life of the project.
 */

describe('findAllBrackets', () => {
  it('marks the trailing form variadic and names the argument without the dots', () => {
    expect(findAllBrackets('typecheck [patterns...]')).toEqual([
      { required: false, value: 'patterns', variadic: true },
    ])
  })

  it('still marks the leading form variadic', () => {
    expect(findAllBrackets('typecheck [...patterns]')).toEqual([
      { required: false, value: 'patterns', variadic: true },
    ])
  })

  it('handles the required spellings too', () => {
    expect(findAllBrackets('run <files...>')).toEqual([
      { required: true, value: 'files', variadic: true },
    ])
    expect(findAllBrackets('run <...files>')).toEqual([
      { required: true, value: 'files', variadic: true },
    ])
  })

  it('leaves a non-variadic argument alone', () => {
    expect(findAllBrackets('greet <name> [greeting]')).toEqual([
      { required: true, value: 'name', variadic: false },
      { required: false, value: 'greeting', variadic: false },
    ])
  })
})

describe('a command declared with the trailing form', () => {
  it('receives every argument, not just the first', async () => {
    const app = cli('mycli')
    let received: unknown

    app.command('check [files...]', 'check files').action((files: unknown) => {
      received = files
    })

    await app.parse(['bun', 'mycli', 'check', 'a.ts', 'b.ts', 'c.ts'], { run: true })

    expect(received).toEqual(['a.ts', 'b.ts', 'c.ts'])
  })

  it('receives an empty list when none are given', async () => {
    const app = cli('mycli')
    let received: unknown

    app.command('check [files...]', 'check files').action((files: unknown) => {
      received = files
    })

    await app.parse(['bun', 'mycli', 'check'], { run: true })

    expect(received).toEqual([])
  })

  it('keeps a leading fixed argument separate from the rest', async () => {
    const app = cli('mycli')
    let target: unknown
    let rest: unknown

    app.command('copy <target> [files...]', 'copy files').action((a: unknown, b: unknown) => {
      target = a
      rest = b
    })

    await app.parse(['bun', 'mycli', 'copy', 'dest', 'a.ts', 'b.ts'], { run: true })

    expect(target).toBe('dest')
    expect(rest).toEqual(['a.ts', 'b.ts'])
  })
})

describe('a command declared with a single argument', () => {
  it('still receives a bare value rather than a list', async () => {
    const app = cli('mycli')
    let received: unknown

    app.command('greet <name>', 'greet').action((name: unknown) => {
      received = name
    })

    await app.parse(['bun', 'mycli', 'greet', 'ada'], { run: true })

    expect(received).toBe('ada')
  })
})

/**
 * An option declared to take a list always yields a list.
 *
 * The underlying parser returns a bare value for a single occurrence and an
 * array once a flag repeats, so `--allow [ip...]` handed back a STRING for
 * `--allow a` and an ARRAY for `--allow a --allow b`. The shape depended on
 * how many times the user typed the flag, and the natural consumer -
 * `options.allow.map(...)`, or a `for…of` - iterated the characters of that
 * string in the single case, failing as a list of one-character IPs rather
 * than as an error.
 *
 * Every consumer had to write `Array.isArray(x) ? x : [x]` to be correct.
 */

async function allowOption(argv: string[], config: Record<string, unknown> = { default: false }) {
  const app = cli('buddy')
  let received: unknown

  app
    .command('down', 'maintenance mode')
    .option('--allow [ip...]', 'allowed IPs', config)
    .action((options: Record<string, unknown>) => {
      received = options.allow
    })

  await app.parse(['bun', 'buddy', 'down', ...argv], { run: true })
  return received
}

describe('a variadic option', () => {
  it('yields a one-element array for a single occurrence', async () => {
    expect(await allowOption(['--allow', '1.1.1.1'])).toEqual(['1.1.1.1'])
  })

  it('yields an array for repeated occurrences', async () => {
    expect(await allowOption(['--allow', '1.1.1.1', '--allow', '2.2.2.2'])).toEqual(['1.1.1.1', '2.2.2.2'])
  })

  it('yields an array for the --flag=value form too', async () => {
    expect(await allowOption(['--allow=1.1.1.1'])).toEqual(['1.1.1.1'])
  })

  it('leaves a declared default exactly as the author wrote it', async () => {
    // `{ default: false }` is a sentinel meaning "not supplied", not an empty
    // list, so it must not be wrapped into `[false]`.
    expect(await allowOption([])).toBe(false)
  })

  it('leaves an option that was never supplied and has no default undefined', async () => {
    expect(await allowOption([], {})).toBeUndefined()
  })

  it('does not wrap a non-variadic option', async () => {
    const app = cli('buddy')
    let received: unknown

    app
      .command('serve', 'serve')
      .option('--host [name]', 'host')
      .action((options: Record<string, unknown>) => {
        received = options.host
      })

    await app.parse(['bun', 'buddy', 'serve', '--host', 'localhost'], { run: true })

    expect(received).toBe('localhost')
  })
})
