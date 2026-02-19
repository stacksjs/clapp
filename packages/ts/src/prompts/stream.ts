import type { LogMessageOptions } from './log'
import process from 'node:process'
import { stripVTControlCharacters as strip } from 'node:util'
import color from '../colors'
import { S_BAR, S_ERROR, S_INFO, S_STEP_SUBMIT, S_SUCCESS, S_WARN } from './common'

function getPrefix(): string {
  return `${color.gray(S_BAR)}  `
}
const prefix = getPrefix()

interface Stream {
  message: (iterable: Iterable<string> | AsyncIterable<string>, opts?: LogMessageOptions) => Promise<void>
  info: (iterable: Iterable<string> | AsyncIterable<string>) => Promise<void>
  success: (iterable: Iterable<string> | AsyncIterable<string>) => Promise<void>
  step: (iterable: Iterable<string> | AsyncIterable<string>) => Promise<void>
  warn: (iterable: Iterable<string> | AsyncIterable<string>) => Promise<void>
  warning: (iterable: Iterable<string> | AsyncIterable<string>) => Promise<void>
  error: (iterable: Iterable<string> | AsyncIterable<string>) => Promise<void>
}

// TODO (43081j): this currently doesn't support custom `output` writables
// because we rely on `columns` existing (i.e. `process.stdout.columns).
//
// If we want to support `output` being passed in, we will need to use
// a condition like `if (output insance Writable)` to check if it has columns
export const stream: Stream = {
  message: async (
    iterable: Iterable<string> | AsyncIterable<string>,
    { symbol = color.gray(S_BAR) }: LogMessageOptions = {},
  ) => {
    process.stdout.write(`${color.gray(S_BAR)}\n${symbol}  `)
    let lineWidth = 3
    for await (let chunk of iterable) {
      chunk = chunk.replace(/\n/g, `\n${prefix}`)
      if (chunk.includes('\n')) {
        lineWidth = 3 + strip(chunk.slice(chunk.lastIndexOf('\n'))).length
      }
      const chunkLen = strip(chunk).length
      if (lineWidth + chunkLen < process.stdout.columns) {
        lineWidth += chunkLen
        process.stdout.write(chunk)
      }
      else {
        process.stdout.write(`\n${prefix}${chunk.trimStart()}`)
        lineWidth = 3 + strip(chunk.trimStart()).length
      }
    }
    process.stdout.write('\n')
  },
  info: (iterable: Iterable<string> | AsyncIterable<string>) => {
    return stream.message(iterable, { symbol: color.blue(S_INFO) })
  },
  success: (iterable: Iterable<string> | AsyncIterable<string>) => {
    return stream.message(iterable, { symbol: color.green(S_SUCCESS) })
  },
  step: (iterable: Iterable<string> | AsyncIterable<string>) => {
    return stream.message(iterable, { symbol: color.green(S_STEP_SUBMIT) })
  },
  warn: (iterable: Iterable<string> | AsyncIterable<string>) => {
    return stream.message(iterable, { symbol: color.yellow(S_WARN) })
  },
  /** alias for `log.warn()`. */
  warning: (iterable: Iterable<string> | AsyncIterable<string>) => {
    return stream.warn(iterable)
  },
  error: (iterable: Iterable<string> | AsyncIterable<string>) => {
    return stream.message(iterable, { symbol: color.red(S_ERROR) })
  },
}
