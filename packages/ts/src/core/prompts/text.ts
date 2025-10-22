import type { PromptOptions } from './prompt'
import color from 'picocolors'
import Prompt from './prompt'

interface TextOptions extends PromptOptions<string, TextPrompt> {
  placeholder?: string
  defaultValue?: string
}

export default class TextPrompt extends Prompt<string> {
  private placeholder?: string

  get userInputWithCursor(): string {
    if (this.state === 'submit') {
      return this.userInput
    }
    const userInput = this.userInput
    if (this.cursor >= userInput.length) {
      return `${this.userInput}█`
    }
    const s1 = userInput.slice(0, this.cursor)
    const [s2, ...s3] = userInput.slice(this.cursor)
    return `${s1}${color.inverse(s2)}${s3.join('')}`
  }

  get cursor(): number {
    return this._cursor
  }

  constructor(opts: TextOptions) {
    super({ ...opts, initialUserInput: opts.initialUserInput ?? opts.initialValue } as unknown as PromptOptions<string, Prompt<string>>)

    this.placeholder = opts.placeholder

    this.on('key', (char) => {
      if (char === '\t' && this.placeholder) {
        if (!this.value) {
          this._setValue(this.placeholder)
          this._setUserInput(this.placeholder, true)
        }
      }
    })

    this.on('userInput', (input) => {
      this._setValue(input)
    })

    this.on('finalize', () => {
      // If no user input was provided but we have a placeholder, use it
      if (!this.userInput && this.placeholder) {
        this.value = this.placeholder
      }
      // If we still don't have a value, use the default value
      if (!this.value) {
        this.value = opts.defaultValue
      }
      if (this.value === undefined) {
        this.value = ''
      }
    })
  }
}
