import type { PromptState as State } from '../types'
import type { SpinnerOptions, SpinnerResult } from './spinner'
import color from '../colors'
import { unicodeOr } from './common'
import { spinner } from './spinner'

const S_PROGRESS_CHAR: Record<NonNullable<ProgressOptions['style']>, string> = {
  light: unicodeOr('─', '-'),
  heavy: unicodeOr('━', '='),
  block: unicodeOr('█', '#'),
}

export interface ProgressOptions extends SpinnerOptions {
  style?: 'light' | 'heavy' | 'block'
  max?: number
  size?: number
}

export interface ProgressResult extends SpinnerResult {
  advance: (step?: number, msg?: string) => void
}

export function progress(options: ProgressOptions = {}): ProgressResult {
  const {
    style = 'heavy',
    max: userMax = 100,
    size: userSize = 40,
    ...spinnerOptions
  } = options
  const spin = spinner(spinnerOptions)
  let value = 0
  let previousMessage = ''

  const max = Math.max(1, userMax)
  const size = Math.max(1, userSize)

  const activeStyle = (state: State) => {
    switch (state) {
      case 'initial':
      case 'active':
        return color.magenta
      case 'error':
      case 'cancel':
        return color.red
      case 'submit':
        return color.green
      default:
        return color.magenta
    }
  }

  const drawProgress = (state: State, msg: string) => {
    const active = Math.floor((value / max) * size)
    return `${activeStyle(state)(S_PROGRESS_CHAR[style].repeat(active))}${color.dim(S_PROGRESS_CHAR[style].repeat(size - active))} ${msg}`
  }

  const start = (msg = '') => {
    previousMessage = msg
    return spin.start(drawProgress('initial', msg))
  }

  const advance = (step = 1, msg?: string): void => {
    value = Math.min(max, step + value)
    spin.message(drawProgress('active', msg ?? previousMessage))
    previousMessage = msg ?? previousMessage
  }

  return {
    start,
    stop: spin.stop,
    advance,
    isCancelled: spin.isCancelled,
    message: (msg?: string) => advance(0, msg),
  }
}
