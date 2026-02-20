import type { PromptOptions } from './prompt'
import Prompt from './prompt'

interface SelectKeyOptions<T extends { value: string }> extends PromptOptions<T['value'], SelectKeyPrompt<T>> {
  options: T[]
}
export default class SelectKeyPrompt<T extends { value: string }> extends Prompt<T['value']> {
  options: T[]
  cursor = 0

  constructor(opts: SelectKeyOptions<T>) {
    super(opts as unknown as PromptOptions<T['value'], Prompt<T['value']>>, false)

    this.options = opts.options
    // eslint-disable-next-line no-unused-vars
    const keys = this.options.map(({ value: [initial] }) => initial?.toLowerCase())
    this.cursor = Math.max(keys.indexOf(opts.initialValue), 0)

    this.on('key', (key) => {
      if (!key || !keys.includes(key))
        return
      // eslint-disable-next-line no-unused-vars
      const value = this.options.find(({ value: [initial] }) => initial?.toLowerCase() === key)
      if (value) {
        this.value = value.value
        this.state = 'submit'
        this.emit('submit')
      }
    })
  }
}
