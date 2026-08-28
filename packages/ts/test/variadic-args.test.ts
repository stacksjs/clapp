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
