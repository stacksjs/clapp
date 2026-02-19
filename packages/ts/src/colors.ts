/**
 * Lightweight color functions — replaces `picocolors` dependency.
 * Uses standard ANSI escape codes. Zero dependencies.
 * Respects NO_COLOR, FORCE_COLOR, and TTY detection.
 */

import process from 'node:process'
import tty from 'node:tty'

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

const enabled = detectColorSupport()

function wrap(open: string, close: string): (text: string) => string {
  if (!enabled) return (text: string) => text
  return (text: string) => open + text + close
}

// Text colors
export const reset = wrap('\x1B[0m', '\x1B[0m')
export const red = wrap('\x1B[31m', '\x1B[39m')
export const green = wrap('\x1B[32m', '\x1B[39m')
export const yellow = wrap('\x1B[33m', '\x1B[39m')
export const blue = wrap('\x1B[34m', '\x1B[39m')
export const magenta = wrap('\x1B[35m', '\x1B[39m')
export const cyan = wrap('\x1B[36m', '\x1B[39m')
export const white = wrap('\x1B[37m', '\x1B[39m')
export const gray = wrap('\x1B[90m', '\x1B[39m')

// Text decorations
export const bold = wrap('\x1B[1m', '\x1B[22m')
export const italic = wrap('\x1B[3m', '\x1B[23m')
export const underline = wrap('\x1B[4m', '\x1B[24m')
export const dim = wrap('\x1B[2m', '\x1B[22m')
export const inverse = wrap('\x1B[7m', '\x1B[27m')
export const hidden = wrap('\x1B[8m', '\x1B[28m')
export const strikethrough = wrap('\x1B[9m', '\x1B[29m')

// Background colors
export const bgRed = wrap('\x1B[41m', '\x1B[49m')
export const bgGreen = wrap('\x1B[42m', '\x1B[49m')
export const bgYellow = wrap('\x1B[43m', '\x1B[49m')
export const bgBlue = wrap('\x1B[44m', '\x1B[49m')
export const bgMagenta = wrap('\x1B[45m', '\x1B[49m')
export const bgCyan = wrap('\x1B[46m', '\x1B[49m')
export const bgWhite = wrap('\x1B[47m', '\x1B[49m')

export const isColorSupported = enabled

// Default export for picocolors-compatible usage: `import color from './colors'`
export default {
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
