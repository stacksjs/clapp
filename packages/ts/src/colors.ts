/**
 * Lightweight color functions — replaces `picocolors` dependency.
 * Uses standard ANSI escape codes. Zero dependencies.
 * Respects NO_COLOR, FORCE_COLOR, and TTY detection.
 */

import process from 'node:process'
import tty from 'node:tty'

type ColorFn = (text: string) => string

function detectColorSupport(): boolean {
  if ('FORCE_COLOR' in process.env) {
    return process.env.FORCE_COLOR !== '0'
  }
  if ('NO_COLOR' in process.env || process.env.TERM === 'dumb') {
    return false
  }
  if (process.platform === 'win32') {
    return true
  }
  return tty.isatty(1) && tty.isatty(2)
}

const enabled: boolean = detectColorSupport()

function wrap(open: string, close: string): ColorFn {
  if (!enabled) return (text: string) => text
  return (text: string) => open + text + close
}

// Text colors
export const reset: ColorFn = wrap('\x1B[0m', '\x1B[0m')
export const red: ColorFn = wrap('\x1B[31m', '\x1B[39m')
export const green: ColorFn = wrap('\x1B[32m', '\x1B[39m')
export const yellow: ColorFn = wrap('\x1B[33m', '\x1B[39m')
export const blue: ColorFn = wrap('\x1B[34m', '\x1B[39m')
export const magenta: ColorFn = wrap('\x1B[35m', '\x1B[39m')
export const cyan: ColorFn = wrap('\x1B[36m', '\x1B[39m')
export const white: ColorFn = wrap('\x1B[37m', '\x1B[39m')
export const gray: ColorFn = wrap('\x1B[90m', '\x1B[39m')

// Text decorations
export const bold: ColorFn = wrap('\x1B[1m', '\x1B[22m')
export const italic: ColorFn = wrap('\x1B[3m', '\x1B[23m')
export const underline: ColorFn = wrap('\x1B[4m', '\x1B[24m')
export const dim: ColorFn = wrap('\x1B[2m', '\x1B[22m')
export const inverse: ColorFn = wrap('\x1B[7m', '\x1B[27m')
export const hidden: ColorFn = wrap('\x1B[8m', '\x1B[28m')
export const strikethrough: ColorFn = wrap('\x1B[9m', '\x1B[29m')

// Background colors
export const bgRed: ColorFn = wrap('\x1B[41m', '\x1B[49m')
export const bgGreen: ColorFn = wrap('\x1B[42m', '\x1B[49m')
export const bgYellow: ColorFn = wrap('\x1B[43m', '\x1B[49m')
export const bgBlue: ColorFn = wrap('\x1B[44m', '\x1B[49m')
export const bgMagenta: ColorFn = wrap('\x1B[45m', '\x1B[49m')
export const bgCyan: ColorFn = wrap('\x1B[46m', '\x1B[49m')
export const bgWhite: ColorFn = wrap('\x1B[47m', '\x1B[49m')

export const isColorSupported: boolean = enabled

// Default export for picocolors-compatible usage: `import color from './colors'`
interface Colors {
  reset: ColorFn
  red: ColorFn
  green: ColorFn
  yellow: ColorFn
  blue: ColorFn
  magenta: ColorFn
  cyan: ColorFn
  white: ColorFn
  gray: ColorFn
  bold: ColorFn
  italic: ColorFn
  underline: ColorFn
  dim: ColorFn
  inverse: ColorFn
  hidden: ColorFn
  strikethrough: ColorFn
  bgRed: ColorFn
  bgGreen: ColorFn
  bgYellow: ColorFn
  bgBlue: ColorFn
  bgMagenta: ColorFn
  bgCyan: ColorFn
  bgWhite: ColorFn
  isColorSupported: boolean
}

const colors: Colors = {
  reset,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  white,
  gray,
  bold,
  italic,
  underline,
  dim,
  inverse,
  hidden,
  strikethrough,
  bgRed,
  bgGreen,
  bgYellow,
  bgBlue,
  bgMagenta,
  bgCyan,
  bgWhite,
  isColorSupported,
}

export default colors
