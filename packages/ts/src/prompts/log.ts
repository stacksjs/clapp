import type { CommonOptions } from './common'
import process from 'node:process'
import pc from 'picocolors'
import {
  processMarkdown,
  S_BAR,
  S_ERROR,
  S_INFO,
  S_STEP_SUBMIT,
  S_SUCCESS,
  S_WARN,
} from './common'

export interface LogMessageOptions extends CommonOptions {
  symbol?: string
  spacing?: number
  secondarySymbol?: string
}

export interface Log {
  message: (message: string | string[], opts?: LogMessageOptions) => void
  info: (message: string, opts?: LogMessageOptions) => void
  success: (message: string, opts?: LogMessageOptions) => void
  step: (message: string, opts?: LogMessageOptions) => void
  warn: (message: string, opts?: LogMessageOptions) => void
  warning: (message: string, opts?: LogMessageOptions) => void
  error: (message: string, opts?: LogMessageOptions) => void
  custom: (
    symbol: string,
    message: string | string[],
    color: string | ((text: string) => string),
    opts?: LogMessageOptions,
  ) => void
}

// Helper function to process markdown in messages
function processMessage(message: string | string[]): string | string[] {
  if (Array.isArray(message)) {
    return message.map(m => processMarkdown(m))
  }
  return processMarkdown(message)
}

// TODO: update through clarity
export const log: Log = {
  message: (
    message: string | string[] = [],
    {
      symbol = pc.gray(S_BAR),
      secondarySymbol = pc.gray(S_BAR),
      output = process.stdout,
      spacing = 1,
    }: LogMessageOptions = {},
  ) => {
    const parts: string[] = []
    for (let i = 0; i < spacing; i++) {
      parts.push(`${secondarySymbol}`)
    }
    // Process markdown in message
    const processedMessage = processMessage(message)
    const messageParts = Array.isArray(processedMessage) ? processedMessage : processedMessage.split('\n')
    if (messageParts.length > 0) {
      const [firstLine, ...lines] = messageParts
      if (firstLine.length > 0) {
        parts.push(`${symbol}  ${firstLine}`)
      }
      else {
        parts.push(symbol)
      }
      for (const ln of lines) {
        if (ln.length > 0) {
          parts.push(`${secondarySymbol}  ${ln}`)
        }
        else {
          parts.push(secondarySymbol)
        }
      }
    }
    output.write(`${parts.join('\n')}\n`)
  },
  info: (message: string, opts?: LogMessageOptions) => {
    log.message(message, { ...opts, symbol: pc.blue(S_INFO) })
  },
  success: (message: string, opts?: LogMessageOptions) => {
    log.message(message, { ...opts, symbol: pc.green(S_SUCCESS) })
  },
  step: (message: string, opts?: LogMessageOptions) => {
    log.message(message, { ...opts, symbol: pc.green(S_STEP_SUBMIT) })
  },
  warn: (message: string, opts?: LogMessageOptions) => {
    log.message(message, { ...opts, symbol: pc.yellow(S_WARN) })
  },
  /** alias for `log.warn()`. */
  warning: (message: string, opts?: LogMessageOptions) => {
    log.warn(message, opts)
  },
  error: (message: string, opts?: LogMessageOptions) => {
    log.message(message, { ...opts, symbol: pc.red(S_ERROR) })
  },
  custom: (
    symbol: string,
    message: string | string[],
    color: string | ((text: string) => string),
    opts?: LogMessageOptions,
  ) => {
    // Convert string color name to picocolors function
    const colorFn = typeof color === 'string'
      ? (text: string) => (pc as any)[color]?.(text) || text
      : color

    log.message(message, {
      ...opts,
      symbol: colorFn(symbol),
      secondarySymbol: colorFn(symbol),
    })
  },
}
