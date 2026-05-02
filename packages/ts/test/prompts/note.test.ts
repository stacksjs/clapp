import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, jest, test } from 'bun:test'
import * as prompts from '../../src'
import { MockReadable, MockWritable } from '../utils'

describe.each(['true', 'false'])('note (isCI = %s)', (isCI) => {
  let originalCI: string | undefined
  let output: MockWritable
  let input: MockReadable

  beforeAll(() => {
    originalCI = process.env.CI
    process.env.CI = isCI
  })

  afterAll(() => {
    process.env.CI = originalCI
  })

  beforeEach(() => {
    output = new MockWritable()
    input = new MockReadable()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('renders message with title', () => {
    prompts.note('message', 'title', {
      input,
      output,
    })

    expect(output.buffer).toMatchSnapshot()
  })

  test('renders as wide as longest line', () => {
    prompts.note('short\nsomewhat questionably long line', 'title', {
      input,
      output,
    })

    expect(output.buffer).toMatchSnapshot()
  })

  test('formatter which adds length works', () => {
    prompts.note('line 0\nline 1\nline 2', 'title', {
      format: line => `* ${line} *`,
      input,
      output,
    })

    expect(output.buffer).toMatchSnapshot()
  })

  test('formatter which adds colors works', () => {
    // Use hardcoded ANSI codes instead of `colors.red(line)` — picocolors
    // enables colors when `process.env.CI` is set (its `isColorSupported`
    // detection treats CI as a yes), which means the test would emit
    // colored output in CI but bare output locally, making the snapshot
    // non-deterministic across environments.
    prompts.note('line 0\nline 1\nline 2', 'title', {
      format: line => `\x1B[31m${line}\x1B[39m`,
      input,
      output,
    })

    expect(output.buffer).toMatchSnapshot()
  })
})
