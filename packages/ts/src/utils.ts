import type Option from './Option'
import process from 'node:process'

export function removeBrackets(v: string): string {
  return v.replace(/[<[].+/, '').trim()
}

export function findAllBrackets(v: string): {
  required: boolean
  value: string
  variadic: boolean
}[] {
  const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g
  const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g

  const res = []

  const parse = (match: string[]) => {
    let variadic = false
    let value = match[1]
    if (value.startsWith('...')) {
      value = value.slice(3)
      variadic = true
    }
    return {
      required: match[0].startsWith('<'),
      value,
      variadic,
    }
  }

  let angledMatch
  // eslint-disable-next-line no-cond-assign
  while ((angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v))) {
    res.push(parse(angledMatch))
  }

  let squareMatch
  // eslint-disable-next-line no-cond-assign
  while ((squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v))) {
    res.push(parse(squareMatch))
  }

  return res
}

interface MriOptions {
  alias: {
    [k: string]: string[]
  }
  boolean: string[]
}

export function getMriOptions(options: Option[]): MriOptions {
  const result: MriOptions = { alias: {}, boolean: [] }

  for (const [index, option] of options.entries()) {
    // We do not set default values in mri options
    // Since its type (typeof) will be used to cast parsed arguments.
    // Which mean `--foo foo` will be parsed as `{foo: true}` if we have `{default:{foo: true}}`

    // Set alias
    if (option.names.length > 1) {
      result.alias[option.names[0]] = option.names.slice(1)
    }
    // Set boolean
    if (option.isBoolean) {
      if (option.negated) {
        // For negated option
        // We only set it to `boolean` type when there's no string-type option with the same name
        const hasStringTypeOption = options.some((o, i) => {
          return (
            i !== index
            && o.names.some(name => option.names.includes(name))
            && typeof o.required === 'boolean'
          )
        })
        if (!hasStringTypeOption) {
          result.boolean.push(option.names[0])
        }
      }
      else {
        result.boolean.push(option.names[0])
      }
    }
  }

  return result
}

export function findLongest(arr: string[]): string {
  return arr.sort((a, b) => {
    return a.length > b.length ? -1 : 1
  })[0]
}

export function padRight(str: string, length: number): string {
  return str.length >= length ? str : `${str}${' '.repeat(length - str.length)}`
}

export function camelcase(input: string): string {
  return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
    return p1 + p2.toUpperCase()
  })
}

export function setDotProp(
  obj: { [k: string]: any },
  keys: string[],
  val: any,
): void {
  let i = 0
  const length = keys.length
  let t = obj
  let x
  for (; i < length; ++i) {
    x = t[keys[i]]
    t = t[keys[i]]
      = i === length - 1
        ? val
        : x != null
          ? x
          : !!~keys[i + 1].indexOf('.') || !(+keys[i + 1] > -1)
              ? {}
              : []
  }
}

export function setByType(
  obj: { [k: string]: any },
  transforms: { [k: string]: any },
): void {
  for (const key of Object.keys(transforms)) {
    const transform = transforms[key]

    if (transform.shouldTransform) {
      obj[key] = Array.prototype.concat.call([], obj[key])

      if (typeof transform.transformFunction === 'function') {
        obj[key] = obj[key].map(transform.transformFunction)
      }
    }
  }
}

export function getFileName(input: string): string {
  const m = /([^\\/]+)$/.exec(input)
  return m ? m[1] : ''
}

export function camelcaseOptionName(name: string): string {
  // Camelcase the option name
  // Don't camelcase anything after the dot `.`
  return name
    .split('.')
    .map((v, i) => {
      return i === 0 ? camelcase(v) : v
    })
    .join('.')
}

export class ClappError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    }
    else {
      this.stack = new Error(message).stack
    }
  }
}

// Thank you to
//  https://github.com/sindresorhus/is-unicode-supported/blob/main/index.js
export function isUnicodeSupported(): boolean {
  const { env } = process
  const { TERM, TERM_PROGRAM } = env

  if (process.platform !== 'win32') {
    return TERM !== 'linux' // Linux console (kernel)
  }

  return Boolean(env.WT_SESSION) // Windows Terminal
    || Boolean(env.TERMINUS_SUBLIME) // Terminus (<0.2.27)
    || env.ConEmuTask === '{cmd::Cmder}' // ConEmu and cmder
    || TERM_PROGRAM === 'Terminus-Sublime'
    || TERM_PROGRAM === 'vscode'
    || TERM === 'xterm-256color'
    || TERM === 'alacritty'
    || TERM === 'rxvt-unicode'
    || TERM === 'rxvt-unicode-256color'
    || env.TERMINAL_EMULATOR === 'JetBrains-JediTerm'
}

// thanks to sisteransi
export const ESC: string = '\x1B'
export const CSI: string = `${ESC}[`
export const beep: string = '\u0007'

export interface Cursor {
  to: (x: number, y: number) => string
  move: (x: number, y: number) => string
  up: (count?: number) => string
  down: (count?: number) => string
  forward: (count?: number) => string
  backward: (count?: number) => string
  nextLine: (count?: number) => string
  prevLine: (count?: number) => string
  left: string
  hide: string
  show: string
  save: string
  restore: string
}
export const cursor: Cursor = {
  to(x, y) {
    if (!y)
      return `${CSI}${x + 1}G`
    return `${CSI}${y + 1};${x + 1}H`
  },
  move(x, y) {
    let ret = ''

    if (x < 0)
      ret += `${CSI}${-x}D`
    else if (x > 0)
      ret += `${CSI}${x}C`

    if (y < 0)
      ret += `${CSI}${-y}A`
    else if (y > 0)
      ret += `${CSI}${y}B`

    return ret
  },
  up: (count = 1) => `${CSI}${count}A`,
  down: (count = 1) => `${CSI}${count}B`,
  forward: (count = 1) => `${CSI}${count}C`,
  backward: (count = 1) => `${CSI}${count}D`,
  nextLine: (count = 1) => `${CSI}E`.repeat(count),
  prevLine: (count = 1) => `${CSI}F`.repeat(count),
  left: `${CSI}G`,
  hide: `${CSI}?25l`,
  show: `${CSI}?25h`,
  save: `${ESC}7`,
  restore: `${ESC}8`,
}

export interface Scroll {
  up: (count?: number) => string
  down: (count?: number) => string
}
export const scroll: Scroll = {
  up: (count = 1) => `${CSI}S`.repeat(count),
  down: (count = 1) => `${CSI}T`.repeat(count),
}

export interface Erase {
  screen: string
  up: (count?: number) => string
  down: (count?: number) => string
  line: string
  lineEnd: string
  lineStart: string
  lines: (count: number) => string
}
export const erase: Erase = {
  screen: `${CSI}2J`,
  up: (count = 1) => `${CSI}1J`.repeat(count),
  down: (count = 1) => `${CSI}J`.repeat(count),
  line: `${CSI}2K`,
  lineEnd: `${CSI}K`,
  lineStart: `${CSI}1K`,
  lines(count) {
    let clear = ''
    for (let i = 0; i < count; i++)
      clear += this.line + (i < count - 1 ? cursor.up() : '')
    if (count)
      clear += cursor.left
    return clear
  },
}

export interface Clear {
  screen: string
}

export const clear: Clear = {
  screen: `${ESC}c`,
}
