import type { PromptOptions } from './prompt'
import { cursor } from '../../utils'
import Prompt from './prompt'

interface ConfirmOptions extends PromptOptions<boolean, ConfirmPrompt> {
  active: string
  inactive: string
  initialValue?: boolean
}

export default class ConfirmPrompt extends Prompt<boolean> {
  get cursor(): number {
    return this.value ? 0 : 1
  }

  private get _value() {
    return this.cursor === 0
  }

  constructor(opts: ConfirmOptions) {
    super(opts as unknown as PromptOptions<boolean, Prompt<boolean>>, false)
    this.value = !!opts.initialValue

    this.on('userInput', () => {
      this.value = this._value
    })

    this.on('confirm', (confirm) => {
      this.output.write(cursor.move(0, -1))
      this.value = confirm
      this.state = 'submit'
      this.close()
    })

    this.on('cursor', () => {
      this.value = !this.value
    })
  }
}
