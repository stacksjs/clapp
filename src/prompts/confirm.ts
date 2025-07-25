import type { CommonOptions } from './common'
import color from 'picocolors'
import { ConfirmPrompt } from '../core'
import {
  processMarkdown,
  S_BAR,
  S_BAR_END,
  S_RADIO_ACTIVE,
  S_RADIO_INACTIVE,
  symbol,
} from './common'

export interface ConfirmOptions extends CommonOptions {
  message: string
  active?: string
  inactive?: string
  initialValue?: boolean
}
export function confirm(opts: ConfirmOptions) {
  const active = opts.active ?? 'Yes'
  const inactive = opts.inactive ?? 'No'
  const message = processMarkdown(opts.message)

  return new ConfirmPrompt({
    active,
    inactive,
    signal: opts.signal,
    input: opts.input,
    output: opts.output,
    initialValue: opts.initialValue ?? true,
    render() {
      const title = `${color.gray(S_BAR)}\n${symbol(this.state)}  ${message}\n`
      const value = this.value ? active : inactive

      switch (this.state) {
        case 'submit':
          return `${title}${color.gray(S_BAR)}  ${color.dim(value)}`
        case 'cancel':
          return `${title}${color.gray(S_BAR)}  ${color.strikethrough(
            color.dim(value),
          )}\n${color.gray(S_BAR)}`
        default: {
          return `${title}${color.cyan(S_BAR)}  ${
            this.value
              ? `${color.green(S_RADIO_ACTIVE)} ${active}`
              : `${color.dim(S_RADIO_INACTIVE)} ${color.dim(active)}`
          } ${color.dim('/')} ${
            !this.value
              ? `${color.green(S_RADIO_ACTIVE)} ${inactive}`
              : `${color.dim(S_RADIO_INACTIVE)} ${color.dim(inactive)}`
          }\n${color.cyan(S_BAR_END)}\n`
        }
      }
    },
  }).prompt() as Promise<boolean | symbol>
}
