import { describe, expect, test } from 'bun:test'
import { expect as testExpect } from '../src/testing'

describe('Testing Assertion Helpers', () => {
  describe('outputToContain', () => {
    test('passes when string is present', () => {
      const result = {
        stdout: 'Expected output from command',
        stderr: '',
        exitCode: 0,
        duration: 100,
        outputs: [],
        result: null,
      }

      expect(() => testExpect.outputToContain(result, 'Expected output')).not.toThrow()
    })

    test('throws when string is missing', () => {
      const result = {
        stdout: 'Actual output',
        stderr: '',
        exitCode: 0,
        duration: 100,
        outputs: [],
        result: null,
      }

      expect(() => testExpect.outputToContain(result, 'Missing text')).toThrow(/Expected output to contain/)
    })
  })

  describe('outputToMatch', () => {
    test('works with regex patterns', () => {
      const result = {
        stdout: 'Version 1.2.3',
        stderr: '',
        exitCode: 0,
        duration: 100,
        outputs: [],
        result: null,
      }

      expect(() => testExpect.outputToMatch(result, /Version \d+\.\d+\.\d+/)).not.toThrow()
      expect(() => testExpect.outputToMatch(result, /^Build \d+$/)).toThrow()
    })
  })

  describe('exitCode', () => {
    test('assertion passes for matching code', () => {
      const result = {
        stdout: '',
        stderr: '',
        exitCode: 0,
        duration: 100,
        outputs: [],
        result: null,
      }

      expect(() => testExpect.exitCode(result, 0)).not.toThrow()
    })

    test('assertion fails for non-matching code', () => {
      const result = {
        stdout: '',
        stderr: '',
        exitCode: 1,
        duration: 100,
        outputs: [],
        result: null,
      }

      expect(() => testExpect.exitCode(result, 0)).toThrow(/Expected exit code 0, but got 1/)
    })
  })

  describe('completedWithin', () => {
    test('passes when duration is within limit', () => {
      const result = {
        stdout: '',
        stderr: '',
        exitCode: 0,
        duration: 50,
        outputs: [],
        result: null,
      }

      expect(() => testExpect.completedWithin(result, 1000)).not.toThrow()
      expect(() => testExpect.completedWithin(result, 100)).not.toThrow()
    })

    test('fails when duration exceeds limit', () => {
      const result = {
        stdout: '',
        stderr: '',
        exitCode: 0,
        duration: 200,
        outputs: [],
        result: null,
      }

      expect(() => testExpect.completedWithin(result, 100)).toThrow(/Expected command to complete within/)
    })
  })

  describe('outputNotToContain', () => {
    test('passes when string is not present', () => {
      const result = {
        stdout: 'Some output',
        stderr: '',
        exitCode: 0,
        duration: 100,
        outputs: [],
        result: null,
      }

      expect(() => testExpect.outputNotToContain(result, 'Not there')).not.toThrow()
    })

    test('fails when string is present', () => {
      const result = {
        stdout: 'Expected output',
        stderr: '',
        exitCode: 0,
        duration: 100,
        outputs: [],
        result: null,
      }

      expect(() => testExpect.outputNotToContain(result, 'Expected')).toThrow()
    })
  })

  describe('stderrToContain', () => {
    test('passes when error message is in stderr', () => {
      const result = {
        stdout: '',
        stderr: 'Error: Something went wrong',
        exitCode: 1,
        duration: 100,
        outputs: [],
        result: null,
      }

      expect(() => testExpect.stderrToContain(result, 'Something went wrong')).not.toThrow()
    })

    test('fails when error message is not in stderr', () => {
      const result = {
        stdout: '',
        stderr: 'Different error',
        exitCode: 1,
        duration: 100,
        outputs: [],
        result: null,
      }

      expect(() => testExpect.stderrToContain(result, 'Missing error')).toThrow()
    })
  })
})
