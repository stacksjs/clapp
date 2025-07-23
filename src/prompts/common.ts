import type { Readable, Writable } from 'node:stream'
import type { PromptState as State } from '../types'
import process from 'node:process'
import color from 'picocolors'
import { style } from '../style'
import { isUnicodeSupported } from '../utils'

export const unicode: boolean = isUnicodeSupported()
export const isCI = (): boolean => process.env.CI === 'true'
export function isTTY(output: Writable): boolean {
  return (output as Writable & { isTTY?: boolean }).isTTY === true
}

export const unicodeOr: (c: string, fallback: string) => string = (c: string, fallback: string) => (unicode ? c : fallback)
export const S_STEP_ACTIVE: string = unicodeOr('◆', '*')
export const S_STEP_CANCEL: string = unicodeOr('■', 'x')
export const S_STEP_ERROR: string = unicodeOr('▲', 'x')
export const S_STEP_SUBMIT: string = unicodeOr('◇', 'o')

export const S_BAR_START: string = unicodeOr('┌', 'T')
export const S_BAR: string = unicodeOr('│', '|')
export const S_BAR_END: string = unicodeOr('└', '—')

export const S_RADIO_ACTIVE: string = unicodeOr('●', '>')
export const S_RADIO_INACTIVE: string = unicodeOr('○', ' ')
export const S_CHECKBOX_ACTIVE: string = unicodeOr('◻', '[•]')
export const S_CHECKBOX_SELECTED: string = unicodeOr('◼', '[+]')
export const S_CHECKBOX_INACTIVE: string = unicodeOr('◻', '[ ]')
export const S_PASSWORD_MASK: string = unicodeOr('▪', '•')

export const S_BAR_H: string = unicodeOr('─', '-')
export const S_CORNER_TOP_RIGHT: string = unicodeOr('╮', '+')
export const S_CONNECT_LEFT: string = unicodeOr('├', '+')
export const S_CORNER_BOTTOM_RIGHT: string = unicodeOr('╯', '+')

export const S_INFO: string = unicodeOr('●', '•')
export const S_SUCCESS: string = unicodeOr('◆', '*')
export const S_WARN: string = unicodeOr('▲', '!')
export const S_ERROR: string = unicodeOr('■', 'x')

export function symbol(state: State): string {
  switch (state) {
    case 'initial':
    case 'active':
      return color.cyan(S_STEP_ACTIVE)
    case 'cancel':
      return color.red(S_STEP_CANCEL)
    case 'error':
      return color.yellow(S_STEP_ERROR)
    case 'submit':
      return color.green(S_STEP_SUBMIT)
  }
}

export interface CommonOptions {
  input?: Readable
  output?: Writable
  signal?: AbortSignal
}

// Helper function to process markdown in any string
export function processMarkdown(text: string): string {
  return text.replace(/_([^_]+)_/g, (_, content) => style.italic(content))
}
