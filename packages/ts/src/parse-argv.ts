/**
 * Lightweight argv parser — replaces `mri` dependency.
 * Handles: --flag, --key=value, --key value, -abc, --no-flag, aliases, booleans.
 */

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

  function setKey(key: string, value: unknown): void {
    const canonical = aliasOf[key] || key
    result[canonical] = value
    // Also set on all aliases
    if (alias[canonical]) {
      for (const a of alias[canonical]) result[a] = value
    }
    // If key is an alias, also set on its siblings
    if (aliasOf[key] && alias[aliasOf[key]]) {
      for (const a of alias[aliasOf[key]]) result[a] = value
    }
    result[key] = value
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
        // --key=value
        const key = arg.slice(2, eqIdx)
        const value = arg.slice(eqIdx + 1)
        setKey(key, value)
      }
      else {
        const key = arg.slice(2)

        // --no-flag
        if (key.startsWith('no-')) {
          const actualKey = key.slice(3)
          setKey(actualKey, false)
          continue
        }

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
