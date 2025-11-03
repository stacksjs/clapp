import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, mock, setSystemTime, spyOn } from 'bun:test'
import { EventEmitter } from 'node:events'
import { Readable, Writable } from 'node:stream'
import colors from 'picocolors'
import * as prompts from '../src/prompts'
import { isCancel } from '../src/utils/index'
import { settings } from '../src/utils/settings'

// TODO (43081j): move this into a util?
class MockWritable extends Writable {
  public buffer: string[] = []

  _write(
    chunk: any,
    _encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void,
  ): void {
    this.buffer.push(chunk.toString())
    callback()
  }
}

class MockReadable extends Readable {
  protected _buffer: unknown[] | null = []

  _read() {
    if (this._buffer === null) {
      this.push(null)
      return
    }

    for (const val of this._buffer) {
      this.push(val)
    }

    this._buffer = []
  }

  pushValue(val: unknown): void {
    this._buffer?.push(val)
  }

  close(): void {
    this._buffer = null
  }
}

describe.each(['true', 'false'])('prompts (isCI = %s)', (isCI) => {
  let originalCI: string | undefined
  let output: MockWritable
  let input: MockReadable

  beforeAll(() => {
    originalCI = process.env.CI
    process.env.CI = isCI
  })

  beforeEach(() => {
    output = new MockWritable()
    input = new MockReadable()
  })

  afterEach(() => {
    mock.restore()
  })

  afterAll(() => {
    process.env.CI = originalCI
  })

  describe('spinner', () => {
    beforeEach(() => {
      setSystemTime(new Date())
    })

    afterEach(() => {
      setSystemTime()
      mock.restore()
    })

    it('returns spinner API', () => {
      const api = prompts.spinner({ output })

      expect(api.stop).toBeTypeOf('function')
      expect(api.start).toBeTypeOf('function')
      expect(api.message).toBeTypeOf('function')
    })

    describe('start', () => {
      it('renders frames at interval', () => {
        const result = prompts.spinner({ output })

        result.start()

        // there are 4 frames
        for (let i = 0; i < 4; i++) {
          const currentTime = new Date().getTime()
          setSystemTime(new Date(currentTime + 80))
        }

        expect(output.buffer).toMatchSnapshot()
      })

      it('renders message', () => {
        const result = prompts.spinner({ output })

        result.start('foo')

        const currentTime = new Date().getTime()
        setSystemTime(new Date(currentTime + 80))

        expect(output.buffer).toMatchSnapshot()
      })

      it('renders timer when indicator is "timer"', () => {
        const result = prompts.spinner({ output, indicator: 'timer' })

        result.start()

        const currentTime = new Date().getTime()
        setSystemTime(new Date(currentTime + 80))

        expect(output.buffer).toMatchSnapshot()
      })
    })

    describe('stop', () => {
      it('renders submit symbol and stops spinner', () => {
        const result = prompts.spinner({ output })

        result.start()

        const currentTime2 = new Date().getTime()
        setSystemTime(new Date(currentTime2 + 80))

        result.stop()

        const currentTime4 = new Date().getTime()
        setSystemTime(new Date(currentTime4 + 80))

        expect(output.buffer).toMatchSnapshot()
      })

      it('renders cancel symbol if code = 1', () => {
        const result = prompts.spinner({ output })

        result.start()

        const currentTime5 = new Date().getTime()
        setSystemTime(new Date(currentTime5 + 80))

        result.stop('', 1)

        expect(output.buffer).toMatchSnapshot()
      })

      it('renders error symbol if code > 1', () => {
        const result = prompts.spinner({ output })

        result.start()

        const currentTime6 = new Date().getTime()
        setSystemTime(new Date(currentTime6 + 80))

        result.stop('', 2)

        expect(output.buffer).toMatchSnapshot()
      })

      it('renders message', () => {
        const result = prompts.spinner({ output })

        result.start()

        const currentTime7 = new Date().getTime()
        setSystemTime(new Date(currentTime7 + 80))

        result.stop('foo')

        const currentTime9 = new Date().getTime()
        setSystemTime(new Date(currentTime9 + 80))

        expect(output.buffer).toMatchSnapshot()
      })
    })

    describe('message', () => {
      it('sets message for next frame', () => {
        const result = prompts.spinner({ output })

        result.start()

        const currentTime8 = new Date().getTime()
        setSystemTime(new Date(currentTime8 + 80))

        result.message('foo')

        const currentTime9 = new Date().getTime()
        setSystemTime(new Date(currentTime9 + 80))

        expect(output.buffer).toMatchSnapshot()
      })
    })

    describe('process exit handling', () => {
      let processEmitter: EventEmitter

      beforeEach(() => {
        processEmitter = new EventEmitter()

        // Spy on process methods
        spyOn(process, 'on').mockImplementation((ev: string, listener: (...args: any[]) => void) => {
          processEmitter.on(ev, listener)
          return process
        })
        spyOn(process, 'removeListener').mockImplementation((ev: string, listener: (...args: any[]) => void) => {
          processEmitter.removeListener(ev, listener)
          return process
        })
      })

      afterEach(() => {
        processEmitter.removeAllListeners()
        mock.restore()
      })

      it('uses default cancel message', () => {
        const result = prompts.spinner({ output })
        result.start('Test operation')

        processEmitter.emit('SIGINT')

        expect(output.buffer).toMatchSnapshot()
      })

      it('uses custom cancel message when provided directly', () => {
        const result = prompts.spinner({
          output,
          cancelMessage: 'Custom cancel message',
        })
        result.start('Test operation')

        processEmitter.emit('SIGINT')

        expect(output.buffer).toMatchSnapshot()
      })

      it('uses custom error message when provided directly', () => {
        const result = prompts.spinner({
          output,
          errorMessage: 'Custom error message',
        })
        result.start('Test operation')

        processEmitter.emit('exit', 2)

        expect(output.buffer).toMatchSnapshot()
      })

      it('uses global custom cancel message from settings', () => {
        // Store original message
        const originalCancelMessage = settings.messages.cancel
        // Set custom message
        settings.messages.cancel = 'Global cancel message'

        const result = prompts.spinner({ output })
        result.start('Test operation')

        processEmitter.emit('SIGINT')

        expect(output.buffer).toMatchSnapshot()

        // Reset to original
        settings.messages.cancel = originalCancelMessage
      })

      it('uses global custom error message from settings', () => {
        // Store original message
        const originalErrorMessage = settings.messages.error
        // Set custom message
        settings.messages.error = 'Global error message'

        const result = prompts.spinner({ output })
        result.start('Test operation')

        processEmitter.emit('exit', 2)

        expect(output.buffer).toMatchSnapshot()

        // Reset to original
        settings.messages.error = originalErrorMessage
      })

      it('prioritizes direct options over global settings', () => {
        // Store original messages
        const originalCancelMessage = settings.messages.cancel
        const originalErrorMessage = settings.messages.error

        // Set custom global messages
        settings.messages.cancel = 'Global cancel message'
        settings.messages.error = 'Global error message'

        const result = prompts.spinner({
          output,
          cancelMessage: 'Spinner cancel message',
          errorMessage: 'Spinner error message',
        })
        result.start('Test operation')

        processEmitter.emit('SIGINT')
        expect(output.buffer).toMatchSnapshot()

        // Reset buffer
        output.buffer = []

        const result2 = prompts.spinner({
          output,
          cancelMessage: 'Spinner cancel message',
          errorMessage: 'Spinner error message',
        })
        result2.start('Test operation')

        processEmitter.emit('exit', 2)
        expect(output.buffer).toMatchSnapshot()

        // Reset to original values
        settings.messages.cancel = originalCancelMessage
        settings.messages.error = originalErrorMessage
      })
    })
  })

  describe('text', () => {
    it('renders message', async () => {
      const result = prompts.text({
        message: 'foo',
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      await result

      expect(output.buffer).toMatchSnapshot()
    })

    it('renders placeholder if set', async () => {
      const result = prompts.text({
        message: 'foo',
        placeholder: 'bar',
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(output.buffer).toMatchSnapshot()

      expect(value).toBe('bar')
    })

    it('<tab> applies placeholder', async () => {
      const result = prompts.text({
        message: 'foo',
        placeholder: 'bar',
        input,
        output,
      })

      input.emit('keypress', '\t', { name: 'tab' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe('bar')
    })

    it('can cancel', async () => {
      const result = prompts.text({
        message: 'foo',
        input,
        output,
      })

      input.emit('keypress', 'escape', { name: 'escape' })

      const value = await result

      expect(isCancel(value)).toBe(true)
      expect(output.buffer).toMatchSnapshot()
    })

    it('renders cancelled value if one set', async () => {
      const result = prompts.text({
        message: 'foo',
        input,
        output,
      })

      input.emit('keypress', 'x', { name: 'x' })
      input.emit('keypress', 'y', { name: 'y' })
      input.emit('keypress', '', { name: 'escape' })

      const value = await result

      expect(isCancel(value)).toBe(true)
      expect(output.buffer).toMatchSnapshot()
    })

    it('renders submitted value', async () => {
      const result = prompts.text({
        message: 'foo',
        input,
        output,
      })

      input.emit('keypress', 'x', { name: 'x' })
      input.emit('keypress', 'y', { name: 'y' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe('xy')
      expect(output.buffer).toMatchSnapshot()
    })

    it('defaultValue sets the value but does not render', async () => {
      const result = prompts.text({
        message: 'foo',
        defaultValue: 'bar',
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe('bar')
      expect(output.buffer).toMatchSnapshot()
    })

    it('validation errors render and clear', async () => {
      const result = prompts.text({
        message: 'foo',
        validate: val => (val !== 'xy' ? 'should be xy' : undefined),
        input,
        output,
      })

      input.emit('keypress', 'x', { name: 'x' })
      input.emit('keypress', '', { name: 'return' })
      input.emit('keypress', 'y', { name: 'y' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe('xy')
      expect(output.buffer).toMatchSnapshot()
    })

    it('validation errors render and clear (using Error)', async () => {
      const result = prompts.text({
        message: 'foo',
        validate: val => (val !== 'xy' ? new Error('should be xy') : undefined),
        input,
        output,
      })

      input.emit('keypress', 'x', { name: 'x' })
      input.emit('keypress', '', { name: 'return' })
      input.emit('keypress', 'y', { name: 'y' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe('xy')
      expect(output.buffer).toMatchSnapshot()
    })
  })

  describe('confirm', () => {
    it('renders message with choices', async () => {
      const result = prompts.confirm({
        message: 'foo',
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe(true)
      expect(output.buffer).toMatchSnapshot()
    })

    it('renders custom active choice', async () => {
      const result = prompts.confirm({
        message: 'foo',
        active: 'bleep',
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe(true)
      expect(output.buffer).toMatchSnapshot()
    })

    it('renders custom inactive choice', async () => {
      const result = prompts.confirm({
        message: 'foo',
        inactive: 'bleep',
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe(true)
      expect(output.buffer).toMatchSnapshot()
    })

    it('right arrow moves to next choice', async () => {
      const result = prompts.confirm({
        message: 'foo',
        input,
        output,
      })

      input.emit('keypress', 'right', { name: 'right' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe(false)
      expect(output.buffer).toMatchSnapshot()
    })

    it('left arrow moves to previous choice', async () => {
      const result = prompts.confirm({
        message: 'foo',
        input,
        output,
      })

      input.emit('keypress', 'right', { name: 'right' })
      input.emit('keypress', 'left', { name: 'left' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe(true)
      expect(output.buffer).toMatchSnapshot()
    })

    it('can cancel', async () => {
      const result = prompts.confirm({
        message: 'foo',
        input,
        output,
      })

      input.emit('keypress', 'escape', { name: 'escape' })

      const value = await result

      expect(isCancel(value)).toBe(true)
      expect(output.buffer).toMatchSnapshot()
    })

    it('can set initialValue', async () => {
      const result = prompts.confirm({
        message: 'foo',
        initialValue: false,
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe(false)
      expect(output.buffer).toMatchSnapshot()
    })
  })

  describe('select', () => {
    it('renders options and message', async () => {
      const result = prompts.select({
        message: 'foo',
        options: [{ value: 'opt0' }, { value: 'opt1' }],
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe('opt0')
      expect(output.buffer).toMatchSnapshot()
    })

    it('down arrow selects next option', async () => {
      const result = prompts.select({
        message: 'foo',
        options: [{ value: 'opt0' }, { value: 'opt1' }],
        input,
        output,
      })

      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe('opt1')
      expect(output.buffer).toMatchSnapshot()
    })

    it('up arrow selects previous option', async () => {
      const result = prompts.select({
        message: 'foo',
        options: [{ value: 'opt0' }, { value: 'opt1' }],
        input,
        output,
      })

      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'up' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe('opt0')
      expect(output.buffer).toMatchSnapshot()
    })

    it('can cancel', async () => {
      const result = prompts.select({
        message: 'foo',
        options: [{ value: 'opt0' }, { value: 'opt1' }],
        input,
        output,
      })

      input.emit('keypress', 'escape', { name: 'escape' })

      const value = await result

      expect(isCancel(value)).toBe(true)
      expect(output.buffer).toMatchSnapshot()
    })

    it('renders option labels', async () => {
      const result = prompts.select({
        message: 'foo',
        options: [
          { value: 'opt0', label: 'Option 0' },
          { value: 'opt1', label: 'Option 1' },
        ],
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe('opt0')
      expect(output.buffer).toMatchSnapshot()
    })

    it('renders option hints', async () => {
      const result = prompts.select({
        message: 'foo',
        options: [
          { value: 'opt0', hint: 'Hint 0' },
          { value: 'opt1', hint: 'Hint 1' },
        ],
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe('opt0')
      expect(output.buffer).toMatchSnapshot()
    })
  })

  describe('multiselect', () => {
    it('renders message', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [{ value: 'opt0' }, { value: 'opt1' }],
        input,
        output,
      })

      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['opt0'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('renders multiple selected options', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [{ value: 'opt0' }, { value: 'opt1' }, { value: 'opt2' }],
        input,
        output,
      })

      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['opt0', 'opt1'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('can cancel', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [{ value: 'opt0' }, { value: 'opt1' }],
        input,
        output,
      })

      input.emit('keypress', 'escape', { name: 'escape' })

      const value = await result

      expect(isCancel(value)).toBe(true)
      expect(output.buffer).toMatchSnapshot()
    })

    it('renders validation errors', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [{ value: 'opt0' }, { value: 'opt1' }],
        input,
        output,
      })

      // try submit with nothing selected
      input.emit('keypress', '', { name: 'return' })
      // select and submit
      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['opt0'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('can submit without selection when required = false', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [{ value: 'opt0' }, { value: 'opt1' }],
        required: false,
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual([])
      expect(output.buffer).toMatchSnapshot()
    })

    it('can set cursorAt to preselect an option', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [{ value: 'opt0' }, { value: 'opt1' }],
        cursorAt: 'opt1',
        input,
        output,
      })

      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['opt1'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('can set initial values', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [{ value: 'opt0' }, { value: 'opt1' }],
        initialValues: ['opt1'],
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['opt1'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('maxItems renders a sliding window', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [...Array.from({ length: 12 }).keys()].map(k => ({
          value: `opt${k}`,
        })),
        maxItems: 6,
        input,
        output,
      })

      for (let i = 0; i < 6; i++) {
        input.emit('keypress', '', { name: 'down' })
      }
      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['opt6'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('sliding window loops upwards', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [...Array.from({ length: 12 }).keys()].map(k => ({
          value: `opt${k}`,
        })),
        maxItems: 6,
        input,
        output,
      })

      input.emit('keypress', '', { name: 'up' })
      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['opt11'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('sliding window loops downwards', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [...Array.from({ length: 12 }).keys()].map(k => ({
          value: `opt${k}`,
        })),
        maxItems: 6,
        input,
        output,
      })

      for (let i = 0; i < 12; i++) {
        input.emit('keypress', '', { name: 'down' })
      }
      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['opt0'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('can set custom labels', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [
          { value: 'opt0', label: 'Option 0' },
          { value: 'opt1', label: 'Option 1' },
        ],
        input,
        output,
      })

      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['opt0'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('can render option hints', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [
          { value: 'opt0', hint: 'Hint 0' },
          { value: 'opt1', hint: 'Hint 1' },
        ],
        input,
        output,
      })

      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['opt0'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('shows hints for all selected options', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [
          { value: 'opt0', hint: 'Hint 0' },
          { value: 'opt1', hint: 'Hint 1' },
          { value: 'opt2', hint: 'Hint 2' },
        ],
        initialValues: ['opt0', 'opt1'],
        input,
        output,
      })

      // Check that both selected options show their hints
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['opt0', 'opt1'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('renders multiple cancelled values', async () => {
      const result = prompts.multiselect({
        message: 'foo',
        options: [{ value: 'opt0' }, { value: 'opt1' }, { value: 'opt2' }],
        input,
        output,
      })

      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'escape' })

      const value = await result

      expect(isCancel(value)).toBe(true)
      expect(output.buffer).toMatchSnapshot()
    })
  })

  describe('password', () => {
    it('renders message', async () => {
      const result = prompts.password({
        message: 'foo',
        input,
        output,
      })

      input.emit('keypress', '', { name: 'return' })

      await result

      expect(output.buffer).toMatchSnapshot()
    })

    it('renders masked value', async () => {
      const result = prompts.password({
        message: 'foo',
        input,
        output,
      })

      input.emit('keypress', 'x', { name: 'x' })
      input.emit('keypress', 'y', { name: 'y' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toBe('xy')
      expect(output.buffer).toMatchSnapshot()
    })

    it('renders custom mask', async () => {
      const result = prompts.password({
        message: 'foo',
        mask: '*',
        input,
        output,
      })

      input.emit('keypress', 'x', { name: 'x' })
      input.emit('keypress', 'y', { name: 'y' })
      input.emit('keypress', '', { name: 'return' })

      await result

      expect(output.buffer).toMatchSnapshot()
    })

    it('renders and clears validation errors', async () => {
      const result = prompts.password({
        message: 'foo',
        validate: (value) => {
          if (!value || value.length < 2) {
            return 'Password must be at least 2 characters'
          }

          return undefined
        },
        input,
        output,
      })

      input.emit('keypress', 'x', { name: 'x' })
      input.emit('keypress', '', { name: 'return' })
      input.emit('keypress', 'y', { name: 'y' })
      input.emit('keypress', '', { name: 'return' })

      await result

      expect(output.buffer).toMatchSnapshot()
    })

    it('renders cancelled value', async () => {
      const result = prompts.password({
        message: 'foo',
        input,
        output,
      })

      input.emit('keypress', 'x', { name: 'x' })
      input.emit('keypress', '', { name: 'escape' })

      const value = await result

      expect(isCancel(value)).toBe(true)
      expect(output.buffer).toMatchSnapshot()
    })
  })

  describe('groupMultiselect', () => {
    it('renders message with options', async () => {
      const result = prompts.groupMultiselect({
        message: 'foo',
        input,
        output,
        options: {
          group1: [{ value: 'group1value0' }, { value: 'group1value1' }],
          group2: [{ value: 'group2value0' }],
        },
      })

      // Select the first non-group option
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'space' })

      // submit
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['group1value0'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('can select multiple options', async () => {
      const result = prompts.groupMultiselect({
        message: 'foo',
        input,
        output,
        options: {
          group1: [{ value: 'group1value0' }, { value: 'group1value1' }, { value: 'group1value2' }],
        },
      })

      // Select the first non-group option
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'space' })
      // Select the second non-group option
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'space' })

      // submit
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['group1value0', 'group1value1'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('can select a group', async () => {
      const result = prompts.groupMultiselect({
        message: 'foo',
        input,
        output,
        options: {
          group1: [{ value: 'group1value0' }, { value: 'group1value1' }],
        },
      })

      // Select the group as a whole
      input.emit('keypress', '', { name: 'space' })

      // submit
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['group1value0', 'group1value1'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('can select a group by selecting all members', async () => {
      const result = prompts.groupMultiselect({
        message: 'foo',
        input,
        output,
        options: {
          group1: [{ value: 'group1value0' }, { value: 'group1value1' }],
        },
      })

      // Select the first group option
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'space' })
      // Select the second group option
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'space' })

      // submit
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['group1value0', 'group1value1'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('can deselect an option', async () => {
      const result = prompts.groupMultiselect({
        message: 'foo',
        input,
        output,
        options: {
          group1: [{ value: 'group1value0' }, { value: 'group1value1' }],
        },
      })

      // Select the first group option
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'space' })
      // Select the second group option
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'space' })
      // Deselect it
      input.emit('keypress', '', { name: 'space' })

      // submit
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['group1value0'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('renders error when nothing selected', async () => {
      const result = prompts.groupMultiselect({
        message: 'foo',
        input,
        output,
        options: {
          group1: [{ value: 'group1value0' }, { value: 'group1value1' }],
        },
      })

      // try submit
      input.emit('keypress', '', { name: 'return' })
      // now select something and submit
      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['group1value0'])
      expect(output.buffer).toMatchSnapshot()
    })

    describe('selectableGroups = false', () => {
      it('cannot select groups', async () => {
        const result = prompts.groupMultiselect({
          message: 'foo',
          input,
          output,
          options: {
            group1: [{ value: 'group1value0' }, { value: 'group1value1' }],
          },
          selectableGroups: false,
        })

        // first selectable item should be group's child
        input.emit('keypress', '', { name: 'space' })
        input.emit('keypress', '', { name: 'return' })

        const value = await result

        expect(value).toEqual(['group1value0'])
        expect(output.buffer).toMatchSnapshot()
      })

      it('selecting all members of group does not select group', async () => {
        const result = prompts.groupMultiselect({
          message: 'foo',
          input,
          output,
          options: {
            group1: [{ value: 'group1value0' }, { value: 'group1value1' }],
          },
          selectableGroups: false,
        })

        // first selectable item should be group's child
        input.emit('keypress', '', { name: 'space' })
        // select second item
        input.emit('keypress', '', { name: 'down' })
        input.emit('keypress', '', { name: 'space' })
        // submit
        input.emit('keypress', '', { name: 'return' })

        const value = await result

        expect(value).toEqual(['group1value0', 'group1value1'])
        expect(output.buffer).toMatchSnapshot()
      })
    })

    it('can submit empty selection when require = false', async () => {
      const result = prompts.groupMultiselect({
        message: 'foo',
        input,
        output,
        options: {
          group1: [{ value: 'group1value0' }, { value: 'group1value1' }],
        },
        required: false,
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual([])
      expect(output.buffer).toMatchSnapshot()
    })

    it('cursorAt sets initial selection', async () => {
      const result = prompts.groupMultiselect({
        message: 'foo',
        input,
        output,
        options: {
          group1: [{ value: 'group1value0' }, { value: 'group1value1' }],
        },
        cursorAt: 'group1value1',
      })

      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['group1value1'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('initial values can be set', async () => {
      const result = prompts.groupMultiselect({
        message: 'foo',
        input,
        output,
        options: {
          group1: [{ value: 'group1value0' }, { value: 'group1value1' }],
        },
        initialValues: ['group1value1'],
      })

      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual(['group1value1'])
      expect(output.buffer).toMatchSnapshot()
    })

    it('values can be non-primitive', async () => {
      // eslint-disable-next-line symbol-description
      const value0 = Symbol()
      // eslint-disable-next-line symbol-description
      const value1 = Symbol()
      const result = prompts.groupMultiselect({
        message: 'foo',
        input,
        output,
        options: {
          group1: [
            { value: value0, label: 'value0' },
            { value: value1, label: 'value1' },
          ],
        },
      })

      input.emit('keypress', '', { name: 'down' })
      input.emit('keypress', '', { name: 'space' })
      input.emit('keypress', '', { name: 'return' })

      const value = await result

      expect(value).toEqual([value0])
      expect(output.buffer).toMatchSnapshot()
    })

    describe('groupSpacing', () => {
      it('renders spaced groups', async () => {
        const result = prompts.groupMultiselect({
          message: 'foo',
          input,
          output,
          options: {
            group1: [{ value: 'group1value0' }],
            group2: [{ value: 'group2value0' }],
          },
          groupSpacing: 2,
        })

        input.emit('keypress', '', { name: 'down' })
        input.emit('keypress', '', { name: 'space' })
        input.emit('keypress', '', { name: 'return' })

        await result

        expect(output.buffer).toMatchSnapshot()
      })

      it('negative spacing is ignored', async () => {
        const result = prompts.groupMultiselect({
          message: 'foo',
          input,
          output,
          options: {
            group1: [{ value: 'group1value0' }],
            group2: [{ value: 'group2value0' }],
          },
          groupSpacing: -2,
        })

        input.emit('keypress', '', { name: 'down' })
        input.emit('keypress', '', { name: 'space' })
        input.emit('keypress', '', { name: 'return' })

        await result

        expect(output.buffer).toMatchSnapshot()
      })
    })
  })

  describe('note', () => {
    it('renders message with title', () => {
      prompts.note('message', 'title', {
        input,
        output,
      })

      expect(output.buffer).toMatchSnapshot()
    })

    it('renders as wide as longest line', () => {
      prompts.note('short\nsomewhat questionably long line', 'title', {
        input,
        output,
      })

      expect(output.buffer).toMatchSnapshot()
    })

    it('formatter which adds length works', () => {
      prompts.note('line 0\nline 1\nline 2', 'title', {
        format: line => `* ${line} *`,
        input,
        output,
      })

      expect(output.buffer).toMatchSnapshot()
    })

    it('formatter which adds colors works', () => {
      prompts.note('line 0\nline 1\nline 2', 'title', {
        format: line => colors.red(line),
        input,
        output,
      })

      expect(output.buffer).toMatchSnapshot()
    })
  })
})
