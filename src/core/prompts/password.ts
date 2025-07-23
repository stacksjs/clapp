import type { PromptOptions } from './prompt'
import color from 'picocolors'
import Prompt from './prompt'

interface PasswordOptions extends PromptOptions<string, PasswordPrompt> {
  mask?: string
}

export class PasswordPrompt extends Prompt<string> {
  private _mask = '•'

  get cursor(): number {
    return this._cursor
  }

  get masked(): string {
    return this.userInput.replaceAll(/./g, this._mask)
  }

  get userInputWithCursor(): string {
    if (this.state === 'submit' || this.state === 'cancel') {
      return this.masked
    }
    const userInput = this.userInput
    if (this.cursor >= userInput.length) {
      return `${this.masked}${color.inverse(color.hidden('_'))}`
    }
    const masked = this.masked
    const s1 = masked.slice(0, this.cursor)
    const s2 = masked.slice(this.cursor)
    return `${s1}${color.inverse(s2[0])}${s2.slice(1)}`
  }

  constructor({ mask, ...opts }: PasswordOptions) {
    super(opts as unknown as PromptOptions<string, Prompt<string>>)
    this._mask = mask ?? '•'

    this.on('userInput', (input) => {
      this._setValue(input)
    })
  }
}

export default PasswordPrompt
