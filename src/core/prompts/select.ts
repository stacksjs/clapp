import type { PromptOptions } from './prompt'
import Prompt from './prompt'

interface SelectOptions<T extends { value: any }> extends PromptOptions<T['value'], SelectPrompt<T>> {
  options: T[]
  initialValue?: T['value']
}
export default class SelectPrompt<T extends { value: any }> extends Prompt<T['value']> {
  options: T[]
  cursor = 0

  private get _selectedValue() {
    return this.options[this.cursor]
  }

  private changeValue() {
    this.value = this._selectedValue.value
  }

  constructor(opts: SelectOptions<T>) {
    super(opts as unknown as PromptOptions<T['value'], Prompt<T['value']>>, false)

    this.options = opts.options
    this.cursor = this.options.findIndex(({ value }) => value === opts.initialValue)
    if (this.cursor === -1)
      this.cursor = 0
    this.changeValue()

    this.on('cursor', (key) => {
      switch (key) {
        case 'left':
        case 'up':
          this.cursor = this.cursor === 0 ? this.options.length - 1 : this.cursor - 1
          break
        case 'down':
        case 'right':
          this.cursor = this.cursor === this.options.length - 1 ? 0 : this.cursor + 1
          break
      }
      this.changeValue()
    })
  }
}
