/**
 * Lightweight argv parser — replaces `mri` dependency.
 * Handles: --flag, --key=value, --key value, -abc, --no-flag, aliases, booleans.
 */
import { camelcase } from './utils'

interface ParseOptions {
  alias?: Record<string, string[]>
  boolean?: string[]
}

interface ParseResult {
  _: string[]
  [key: string]: unknown
}

export function parseArgv(argv: string[], opts: ParseOptions = {}): ParseResult {
  const result: ParseResult = { _: [] }
  const alias = opts.alias || {}
  const booleans = new Set(opts.boolean || [])

  // Build reverse alias map: alias → canonical name
  const aliasOf: Record<string, string> = {}
  for (const key of Object.keys(alias)) {
    for (const a of alias[key]) {
      aliasOf[a] = key
    }
  }

  // Also add booleans for aliases
  for (const b of booleans) {
    if (alias[b]) {
      for (const a of alias[b]) booleans.add(a)
    }
  }

  /**
   * Merge a repeated flag with what is already there.
   *
   * A flag given more than once collects its values: `--user a --user b`
   * parses as `['a', 'b']`, so a CLI can accept a list without inventing a
   * separator. Repeating a boolean stays `true` — `-v -v` means the same
   * thing as `-v`, and turning it into an array only surprises callers that
   * test it for truth.
   */
  function merge(existing: unknown, value: unknown): unknown {
    if (existing === undefined) return value
    if (typeof value === 'boolean') return value
    return Array.isArray(existing) ? [...existing, value] : [existing, value]
  }

  function setKey(key: string, value: unknown): void {
    const canonical = aliasOf[key] || key
    // Merge once against the canonical name, then write the same value to
    // every spelling — otherwise `-u a -u b` would collect twice through the
    // alias and its canonical name.
    const merged = merge(result[canonical], value)

    result[canonical] = merged
    // Also set on all aliases
    if (alias[canonical]) {
      for (const a of alias[canonical]) result[a] = merged
    }
    // If key is an alias, also set on its siblings
    if (aliasOf[key] && alias[aliasOf[key]]) {
      for (const a of alias[aliasOf[key]]) result[a] = merged
    }
    result[key] = merged
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === '--') {
      // Everything after -- is positional
      result._.push(...argv.slice(i + 1))
      break
    }

    if (arg.startsWith('--')) {
      const eqIdx = arg.indexOf('=')

      if (eqIdx !== -1) {
        // --key=value. Declared option names are camelCased, so the
        // parsed key must be camelCased too (`--dry-run=x` → `dryRun`)
        const key = camelcase(arg.slice(2, eqIdx))
        const value = arg.slice(eqIdx + 1)
        setKey(key, value)
      }
      else {
        const rawKey = arg.slice(2)

        // --no-flag (check the raw spelling before camelCasing, since
        // `no-` would otherwise become `noXxx`)
        if (rawKey.startsWith('no-')) {
          const actualKey = camelcase(rawKey.slice(3))
          setKey(actualKey, false)
          continue
        }

        // Declared option names, aliases, and the boolean table are all
        // camelCased (`--dry-run` registers as `dryRun`). Look the flag
        // up under its camelCased spelling; otherwise a dashed boolean
        // flag misses the boolean table and swallows the next positional
        // argument as its "value".
        const key = camelcase(rawKey)
        const canonical = aliasOf[key] || key
        if (booleans.has(canonical) || booleans.has(key)) {
          setKey(key, true)
        }
        else {
          // Check next arg for value
          const next = argv[i + 1]
          if (next !== undefined && !next.startsWith('-')) {
            setKey(key, next)
            i++
          }
          else {
            setKey(key, true)
          }
        }
      }
    }
    else if (arg.startsWith('-') && arg.length > 1) {
      const chars = arg.slice(1)

      // Short flags: -abc or -f value
      for (let j = 0; j < chars.length; j++) {
        const ch = chars[j]
        const canonical = aliasOf[ch] || ch

        if (j === chars.length - 1 && !booleans.has(canonical) && !booleans.has(ch)) {
          // Last char — may take a value
          const next = argv[i + 1]
          if (next !== undefined && !next.startsWith('-')) {
            setKey(ch, next)
            i++
          }
          else {
            setKey(ch, true)
          }
        }
        else {
          setKey(ch, true)
        }
      }
    }
    else {
      result._.push(arg)
    }
  }

  return result
}
