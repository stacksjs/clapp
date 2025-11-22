import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, setSystemTime, spyOn, test } from 'bun:test'
import { EventEmitter } from 'node:events'
import process from 'node:process'
import * as prompts from '../../src'
import { spinner } from '../../src/prompts/spinner'
import { MockWritable } from '../utils'

describe.each(['true', 'false'])('spinner (isCI = %s)', (isCI) => {
  let originalCI: string | undefined
  let output: MockWritable
  let currentSpinner: ReturnType<typeof spinner> | null = null

  beforeAll(() => {
    originalCI = process.env.CI
    process.env.CI = isCI
  })

  afterAll(() => {
    process.env.CI = originalCI
  })

  beforeEach(() => {
    output = new MockWritable()
    currentSpinner = null
    // Use setSystemTime for time-based tests
    setSystemTime(new Date())
  })

  afterEach(() => {
    // Clean up any active spinner
    if (currentSpinner) {
      try {
        currentSpinner.stop()
      }
      catch {
        // Ignore errors if already stopped
      }
      currentSpinner = null
    }
    // Restore system time
    setSystemTime()
    jest.restoreAllMocks()
  })

  test('returns spinner API', () => {
    currentSpinner = spinner({ output })

    expect(currentSpinner.stop).toBeTypeOf('function')
    expect(currentSpinner.start).toBeTypeOf('function')
    expect(currentSpinner.message).toBeTypeOf('function')
  })

  describe('start', () => {
    test('renders frames at interval', () => {
      currentSpinner = spinner({ output })

      currentSpinner.start()

      // there are 4 frames
      for (let i = 0; i < 4; i++) {
        setSystemTime(new Date(Date.now() + 80))
      }

      expect(output.buffer).toMatchSnapshot()
    })

    test('renders message', () => {
      currentSpinner = spinner({ output })

      currentSpinner.start('foo')

      setSystemTime(new Date(Date.now() + 80))

      expect(output.buffer).toMatchSnapshot()
    })

    test('renders timer when indicator is "timer"', () => {
      currentSpinner = spinner({ output, indicator: 'timer' })

      currentSpinner.start()

      setSystemTime(new Date(Date.now() + 80))

      expect(output.buffer).toMatchSnapshot()
    })
  })

  describe('stop', () => {
    test('renders submit symbol and stops spinner', () => {
      currentSpinner = spinner({ output })

      currentSpinner.start()

      setSystemTime(new Date(Date.now() + 80))

      currentSpinner.stop()

      setSystemTime(new Date(Date.now() + 80))

      expect(output.buffer).toMatchSnapshot()
    })

    test('renders cancel symbol if code = 1', () => {
      currentSpinner = spinner({ output })

      currentSpinner.start()

      setSystemTime(new Date(Date.now() + 80))

      currentSpinner.stop('', 1)

      expect(output.buffer).toMatchSnapshot()
    })

    test('renders error symbol if code > 1', () => {
      currentSpinner = spinner({ output })

      currentSpinner.start()

      setSystemTime(new Date(Date.now() + 80))

      currentSpinner.stop('', 2)

      expect(output.buffer).toMatchSnapshot()
    })

    test('renders message', () => {
      currentSpinner = spinner({ output })

      currentSpinner.start()

      setSystemTime(new Date(Date.now() + 80))

      currentSpinner.stop('foo')

      expect(output.buffer).toMatchSnapshot()
    })

    test('renders message without removing dots', () => {
      currentSpinner = spinner({ output })

      currentSpinner.start()

      setSystemTime(new Date(Date.now() + 80))

      currentSpinner.stop('foo.')

      expect(output.buffer).toMatchSnapshot()
    })
  })

  describe('message', () => {
    test('sets message for next frame', () => {
      currentSpinner = spinner({ output })

      currentSpinner.start()

      setSystemTime(new Date(Date.now() + 80))

      currentSpinner.message('foo')

      setSystemTime(new Date(Date.now() + 80))

      expect(output.buffer).toMatchSnapshot()

      currentSpinner.stop()

      expect(output.buffer).toMatchSnapshot()
    })
  })

  describe('indicator customization', () => {
    test('custom frames', () => {
      currentSpinner = prompts.spinner({ output, frames: ['🐴', '🦋', '🐙', '🐶'] })

      currentSpinner.start()

      // there are 4 frames
      for (let i = 0; i < 4; i++) {
        setSystemTime(new Date(Date.now() + 80))
      }

      currentSpinner.stop()

      expect(output.buffer).toMatchSnapshot()
    })

    test('custom delay', () => {
      currentSpinner = prompts.spinner({ output, delay: 200 })

      currentSpinner.start()

      // there are 4 frames
      for (let i = 0; i < 4; i++) {
        setSystemTime(new Date(Date.now() + 200))
      }

      currentSpinner.stop()

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
      currentSpinner = spinner({ output })
      currentSpinner.start('Test operation')

      processEmitter.emit('SIGINT')

      expect(output.buffer).toMatchSnapshot()
    })

    test('uses custom cancel message when provided directly', () => {
      currentSpinner = spinner({
        output,
        cancelMessage: 'Custom cancel message',
      })
      currentSpinner.start('Test operation')

      processEmitter.emit('SIGINT')

      expect(output.buffer).toMatchSnapshot()
    })

    test('uses custom error message when provided directly', () => {
      currentSpinner = spinner({
        output,
        errorMessage: 'Custom error message',
      })
      currentSpinner.start('Test operation')

      processEmitter.emit('exit', 2)

      expect(output.buffer).toMatchSnapshot()
    })

    test('uses global custom cancel message from settings', () => {
      // Store original message
      const originalCancelMessage = prompts.settings.messages.cancel
      try {
        // Set custom message
        prompts.settings.messages.cancel = 'Global cancel message'

        currentSpinner = spinner({ output })
        currentSpinner.start('Test operation')

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

        currentSpinner = spinner({ output })
        currentSpinner.start('Test operation')

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

        currentSpinner = spinner({
          output,
          errorMessage: 'Spinner error message',
        })
        currentSpinner.start('Test operation')

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

        currentSpinner = spinner({
          output,
          cancelMessage: 'Spinner cancel message',
        })
        currentSpinner.start('Test operation')

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
