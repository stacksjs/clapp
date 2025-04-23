import type { Writable } from 'node:stream'
import type { CommonOptions } from './common'
import process from 'node:process'
import { stripVTControlCharacters as strip } from 'node:util'
import color from 'picocolors'
import {
  processMarkdown,
  S_BAR,
  S_BAR_H,
  S_CONNECT_LEFT,
  S_CORNER_BOTTOM_RIGHT,
  S_CORNER_TOP_RIGHT,
  S_STEP_SUBMIT,
} from './common'

export interface NoteOptions extends CommonOptions {
  format?: (line: string) => string
}

const defaultNoteFormatter = (line: string): string => color.dim(line)

export const note: (message: string, title: string, opts?: NoteOptions) => void = (message = '', title = '', opts?: NoteOptions) => {
  const format = opts?.format ?? defaultNoteFormatter
  const processedMessage = processMarkdown(message)
  const processedTitle = processMarkdown(title)

  const lines = ['', ...processedMessage.split('\n').map(format), '']
  const titleLen = strip(processedTitle).length
  const output: Writable = opts?.output ?? process.stdout
  const len
    = Math.max(
      lines.reduce((sum, ln) => {
        const line = strip(ln)
        return line.length > sum ? line.length : sum
      }, 0),
      titleLen,
    ) + 2
  const msg = lines
    .map(
      ln => `${color.gray(S_BAR)}  ${ln}${' '.repeat(len - strip(ln).length)}${color.gray(S_BAR)}`,
    )
    .join('\n')
  output.write(
    `${color.gray(S_BAR)}\n${color.green(S_STEP_SUBMIT)}  ${color.reset(processedTitle)} ${color.gray(
      S_BAR_H.repeat(Math.max(len - titleLen - 1, 1)) + S_CORNER_TOP_RIGHT,
    )}\n${msg}\n${color.gray(S_CONNECT_LEFT + S_BAR_H.repeat(len + 2) + S_CORNER_BOTTOM_RIGHT)}\n`,
  )
}
