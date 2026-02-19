import type { Writable } from 'node:stream'
import type { CommonOptions } from './common'
import process from 'node:process'
import color from '../colors'
import { S_BAR, S_BAR_END, S_BAR_START } from './common'

export function cancel(message = '', opts?: CommonOptions): void {
  const output: Writable = opts?.output ?? process.stdout
  output.write(`${color.gray(S_BAR_END)}  ${color.red(message)}\n\n`)
}

export function intro(title = '', opts?: CommonOptions): void {
  const output: Writable = opts?.output ?? process.stdout
  output.write(`${color.gray(S_BAR_START)}  ${title}\n`)
}

export function outro(message = '', opts?: CommonOptions): void {
  const output: Writable = opts?.output ?? process.stdout
  output.write(`${color.gray(S_BAR)}\n${color.gray(S_BAR_END)}  ${message}\n\n`)
}
