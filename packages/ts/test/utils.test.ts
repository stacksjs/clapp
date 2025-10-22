import type { Key } from 'node:readline'
import { afterEach, describe, expect, it, mock, spyOn } from 'bun:test'
import { Buffer } from 'node:buffer'
import { cursor } from '../src/utils'
import { block } from '../src/utils/index'
import { MockReadable, MockWritable } from './utils'

describe('utils', () => {
  afterEach(() => {
    mock.restore()
  })

  describe('block', () => {
    it('clears output on keypress', () => {
      const input = new MockReadable()
      const output = new MockWritable()
      const callback = block({ input, output })

      const event: Key = {
        name: 'x',
      }
      const eventData = Buffer.from('bloop')
      input.emit('keypress', eventData, event)
      callback()
      expect(output.buffer).toEqual([cursor.hide, cursor.move(-1, 0), cursor.show])
    })

    it('clears output vertically when return pressed', () => {
      const input = new MockReadable()
      const output = new MockWritable()
      const callback = block({ input, output })

      const event: Key = {
        name: 'return',
      }
      const eventData = Buffer.from('bloop')
      input.emit('keypress', eventData, event)
      callback()
      expect(output.buffer).toEqual([cursor.hide, cursor.move(0, -1), cursor.show])
    })

    it('ignores additional keypresses after dispose', () => {
      const input = new MockReadable()
      const output = new MockWritable()
      const callback = block({ input, output })

      const event: Key = {
        name: 'x',
      }
      const eventData = Buffer.from('bloop')
      input.emit('keypress', eventData, event)
      callback()
      input.emit('keypress', eventData, event)
      expect(output.buffer).toEqual([cursor.hide, cursor.move(-1, 0), cursor.show])
    })

    it('exits on ctrl-c', () => {
      const input = new MockReadable()
      const output = new MockWritable()
      // purposely don't keep the callback since we would exit the process
      block({ input, output })
      // @ts-expect-error - process.exit is mocked
      const spy = spyOn(process, 'exit').mockImplementation(() => {
        // mock implementation
      })

      const event: Key = {
        name: 'c',
      }
      const eventData = Buffer.from('\x03')
      input.emit('keypress', eventData, event)
      expect(spy).toHaveBeenCalled()
      expect(output.buffer).toEqual([cursor.hide, cursor.show])
    })

    it('does not clear if overwrite=false', () => {
      const input = new MockReadable()
      const output = new MockWritable()
      const callback = block({ input, output, overwrite: false })

      const event: Key = {
        name: 'c',
      }
      const eventData = Buffer.from('bloop')
      input.emit('keypress', eventData, event)
      callback()
      expect(output.buffer).toEqual([cursor.hide, cursor.show])
    })
  })
})
