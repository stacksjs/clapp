import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, setSystemTime, spyOn, test } from 'bun:test'
import process from 'node:process'
import { EventEmitter } from 'node:stream'
import * as prompts from '../../src'
import { spinner } from '../../src/prompts/spinner'
import { MockWritable } from '../utils'

describe.each(['true', 'false'])('spinner (isCI = %s)', (isCI) => {
  let originalCI: string | undefined
  let output: MockWritable

  beforeAll(() => {
    originalCI = process.env.CI
    process.env.CI = isCI
  })

  afterAll(() => {
    process.env.CI = originalCI
  })

  beforeEach(() => {
    output = new MockWritable()
    // Use setSystemTime for time-based tests
    setSystemTime(new Date())
  })

  afterEach(() => {
    // Restore system time
    setSystemTime()
    jest.restoreAllMocks()
  })

  test('returns spinner API', () => {
    const api = spinner({ output })

    expect(api.stop).toBeTypeOf('function')
    expect(api.start).toBeTypeOf('function')
    expect(api.message).toBeTypeOf('function')
  })

  describe('start', () => {
    test('renders frames at interval', () => {
      const result = spinner({ output })

      result.start()

      // there are 4 frames
      for (let i = 0; i < 4; i++) {
        setSystemTime(new Date(Date.now() + 80))
      }

      expect(output.buffer).toMatchSnapshot()
    })

    test('renders message', () => {
      const result = spinner({ output })

      result.start('foo')

      setSystemTime(new Date(Date.now() + 80))

      expect(output.buffer).toMatchSnapshot()
    })

    test('renders timer when indicator is "timer"', () => {
      const result = spinner({ output, indicator: 'timer' })

      result.start()

      setSystemTime(new Date(Date.now() + 80))

      expect(output.buffer).toMatchSnapshot()
    })
  })

  describe('stop', () => {
    test('renders submit symbol and stops spinner', () => {
      const result = spinner({ output })

      result.start()

      setSystemTime(new Date(Date.now() + 80))

      result.stop()

      setSystemTime(new Date(Date.now() + 80))

      expect(output.buffer).toMatchSnapshot()
    })

    test('renders cancel symbol if code = 1', () => {
      const result = spinner({ output })

      result.start()

      setSystemTime(new Date(Date.now() + 80))

      result.stop('', 1)

      expect(output.buffer).toMatchSnapshot()
    })

    test('renders error symbol if code > 1', () => {
      const result = spinner({ output })

      result.start()

      setSystemTime(new Date(Date.now() + 80))

      result.stop('', 2)

      expect(output.buffer).toMatchSnapshot()
    })

    test('renders message', () => {
      const result = spinner({ output })

      result.start()

      setSystemTime(new Date(Date.now() + 80))

      result.stop('foo')

      expect(output.buffer).toMatchSnapshot()
    })

    test('renders message without removing dots', () => {
      const result = spinner({ output })

      result.start()

      setSystemTime(new Date(Date.now() + 80))

      result.stop('foo.')

      expect(output.buffer).toMatchSnapshot()
    })
  })

  describe('message', () => {
    test('sets message for next frame', () => {
      const result = spinner({ output })

      result.start()

      setSystemTime(new Date(Date.now() + 80))

      result.message('foo')

      setSystemTime(new Date(Date.now() + 80))

      expect(output.buffer).toMatchSnapshot()

      result.stop()

      expect(output.buffer).toMatchSnapshot()
    })
  })

  describe('indicator customization', () => {
    test('custom frames', () => {
      const result = prompts.spinner({ output, frames: ['🐴', '🦋', '🐙', '🐶'] })

      result.start()

      // there are 4 frames
      for (let i = 0; i < 4; i++) {
        setSystemTime(new Date(Date.now() + 80))
      }

      result.stop()

      expect(output.buffer).toMatchSnapshot()
    })

    test('custom delay', () => {
      const result = prompts.spinner({ output, delay: 200 })

      result.start()

      // there are 4 frames
      for (let i = 0; i < 4; i++) {
        setSystemTime(new Date(Date.now() + 200))
      }

      result.stop()

      expect(output.buffer).toMatchSnapshot()
    })
  })

  describe('process exit handling', () => {
    let processEmitter: EventEmitter

    beforeEach(() => {
      processEmitter = new EventEmitter()

      // Spy on process methods using spyOn from bun:test
      spyOn(process, 'on').mockImplementation((ev: string | symbol, listener: (...args: any[]) => void) => {
        processEmitter.on(ev, listener)
        return process
      })
      spyOn(process, 'removeListener').mockImplementation((ev: string | symbol, listener: (...args: any[]) => void) => {
        processEmitter.removeListener(ev, listener)
        return process
      })
    })

    afterEach(() => {
      processEmitter.removeAllListeners()
    })

    test('uses default cancel message', () => {
      const result = spinner({ output })
      result.start('Test operation')

      processEmitter.emit('SIGINT')

      expect(output.buffer).toMatchSnapshot()
    })

    test('uses custom cancel message when provided directly', () => {
      const result = spinner({
        output,
        cancelMessage: 'Custom cancel message',
      })
      result.start('Test operation')

      processEmitter.emit('SIGINT')

      expect(output.buffer).toMatchSnapshot()
    })

    test('uses custom error message when provided directly', () => {
      const result = spinner({
        output,
        errorMessage: 'Custom error message',
      })
      result.start('Test operation')

      processEmitter.emit('exit', 2)

      expect(output.buffer).toMatchSnapshot()
    })

    test('uses global custom cancel message from settings', () => {
      // Store original message
      const originalCancelMessage = prompts.settings.messages.cancel
      try {
        // Set custom message
        prompts.settings.messages.cancel = 'Global cancel message'

        const result = spinner({ output })
        result.start('Test operation')

        processEmitter.emit('SIGINT')

        expect(output.buffer).toMatchSnapshot()
      }
      finally {
        // Reset to original
        prompts.settings.messages.cancel = originalCancelMessage
      }
    })

    test('uses global custom error message from settings', () => {
      // Store original message
      const originalErrorMessage = prompts.settings.messages.error

      try {
        // Set custom message
        prompts.settings.messages.error = 'Global error message'

        const result = spinner({ output })
        result.start('Test operation')

        processEmitter.emit('exit', 2)

        expect(output.buffer).toMatchSnapshot()
      }
      finally {
        // Reset to original
        prompts.settings.messages.error = originalErrorMessage
      }
    })

    test('prioritizes error option over global setting', () => {
      // Store original messages
      const originalErrorMessage = prompts.settings.messages.error

      try {
        // Set custom global messages
        prompts.settings.messages.error = 'Global error message'

        const result = spinner({
          output,
          errorMessage: 'Spinner error message',
        })
        result.start('Test operation')

        processEmitter.emit('exit', 2)
        expect(output.buffer).toMatchSnapshot()
      }
      finally {
        // Reset to original values
        prompts.settings.messages.error = originalErrorMessage
      }
    })

    test('prioritizes cancel option over global setting', () => {
      // Store original messages
      const originalCancelMessage = prompts.settings.messages.cancel

      try {
        // Set custom global messages
        prompts.settings.messages.cancel = 'Global cancel message'

        const result = spinner({
          output,
          cancelMessage: 'Spinner cancel message',
        })
        result.start('Test operation')

        processEmitter.emit('SIGINT')
        expect(output.buffer).toMatchSnapshot()
      }
      finally {
        // Reset to original values
        prompts.settings.messages.cancel = originalCancelMessage
      }
    })
  })
})
