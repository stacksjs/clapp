import type { PromptOptions } from './prompt'
import Prompt from './prompt'

interface MultiSelectOptions<T extends { value: any }> extends PromptOptions<T['value'][], MultiSelectPrompt<T>> {
  options: T[]
  initialValues?: T['value'][]
  required?: boolean
  cursorAt?: T['value']
}
export default class MultiSelectPrompt<T extends { value: any }> extends Prompt<T['value'][]> {
  options: T[]
  cursor = 0

  private get _value(): T['value'] {
    return this.options[this.cursor].value
  }

  private toggleAll() {
    const allSelected = this.value !== undefined && this.value.length === this.options.length
    this.value = allSelected ? [] : this.options.map(v => v.value)
  }

  private toggleValue() {
    if (this.value === undefined) {
      this.value = []
    }
    const selected = this.value.includes(this._value)
    this.value = selected
      ? this.value.filter(value => value !== this._value)
      : [...this.value, this._value]
  }

  constructor(opts: MultiSelectOptions<T>) {
    super(opts as unknown as PromptOptions<T['value'][], Prompt<T['value'][]>>, false)

    this.options = opts.options
    this.value = [...(opts.initialValues ?? [])]
    this.cursor = Math.max(
      this.options.findIndex(({ value }) => value === opts.cursorAt),
      0,
    )
    this.on('key', (char) => {
      if (char === 'a') {
        this.toggleAll()
      }
    })

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
        case 'space':
          this.toggleValue()
          break
      }
    })
  }
}
