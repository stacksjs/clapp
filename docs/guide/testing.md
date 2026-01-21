---
title: Testing
description: Learn how to test your clapp CLI applications.
---

# Testing

clapp is designed to be testable. This guide covers strategies for testing your CLI applications.

## Testing with Bun

clapp works seamlessly with Bun's built-in test runner:

```bash
bun test
```

## Testing Commands

### Basic Command Test

```ts
import { expect, test } from 'bun:test'
import { CLI } from '@stacksjs/clapp'

test('greet command outputs correct message', () => {
  const output: string[] = []
  const originalLog = console.log
  console.log = (msg: string) => output.push(msg)

  const cli = new CLI('test-app')
  cli
    .command('greet <name>', 'Greet someone')
    .action((name) => {
      console.log(`Hello, ${name}!`)
    })

  cli.parse(['greet', 'World'])

  console.log = originalLog

  expect(output).toContain('Hello, World!')
})
```

### Testing Options

```ts
import { expect, test } from 'bun:test'
import { CLI } from '@stacksjs/clapp'

test('serve command uses default port', () => {
  let capturedOptions: any

  const cli = new CLI('test-app')
  cli
    .command('serve', 'Start server')
    .option('-p, --port <port>', 'Port', { default: 3000 })
    .action((options) => {
      capturedOptions = options
    })

  cli.parse(['serve'])

  expect(capturedOptions.port).toBe(3000)
})

test('serve command uses provided port', () => {
  let capturedOptions: any

  const cli = new CLI('test-app')
  cli
    .command('serve', 'Start server')
    .option('-p, --port <port>', 'Port', { default: 3000 })
    .action((options) => {
      capturedOptions = options
    })

  cli.parse(['serve', '--port', '8080'])

  expect(capturedOptions.port).toBe('8080')
})
```

## Testing with Mocks

### Mocking Console Output

```ts
import { afterEach, beforeEach, expect, test } from 'bun:test'

let output: string[] = []
let originalLog: typeof console.log
let originalError: typeof console.error

beforeEach(() => {
  output = []
  originalLog = console.log
  originalError = console.error
  console.log = (msg: string) => output.push(msg)
  console.error = (msg: string) => output.push(`ERROR: ${msg}`)
})

afterEach(() => {
  console.log = originalLog
  console.error = originalError
})

test('command logs expected output', () => {
  // Your test here
  expect(output).toContain('Expected message')
})
```

### Mocking File System

```ts
import { expect, mock, test } from 'bun:test'
import { CLI } from '@stacksjs/clapp'

test('init command creates config file', async () => {
  const writeFileMock = mock(() => Promise.resolve())

  const cli = new CLI('test-app')
  cli
    .command('init', 'Initialize project')
    .action(async () => {
      await writeFileMock('config.json', '{}')
    })

  await cli.parse(['init'])

  expect(writeFileMock).toHaveBeenCalledWith('config.json', '{}')
})
```

## Testing Async Commands

```ts
import { expect, test } from 'bun:test'
import { CLI } from '@stacksjs/clapp'

test('async command completes successfully', async () => {
  let completed = false

  const cli = new CLI('test-app')
  cli
    .command('fetch', 'Fetch data')
    .action(async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      completed = true
    })

  await cli.parse(['fetch'])

  expect(completed).toBe(true)
})
```

## Testing Error Handling

```ts
import { expect, test } from 'bun:test'
import { CLI } from '@stacksjs/clapp'

test('command throws on invalid input', () => {
  const cli = new CLI('test-app')
  cli
    .command('validate <input>', 'Validate input')
    .action((input) => {
      if (!input.match(/^[a-z]+$/)) {
        throw new Error('Input must contain only lowercase letters')
      }
    })

  expect(() => {
    cli.parse(['validate', '123'])
  }).toThrow('Input must contain only lowercase letters')
})
```

## Integration Testing

Test your CLI as a whole:

```ts
import { expect, test } from 'bun:test'
import { $ } from 'bun'

test('CLI help displays correctly', async () => {
  const result = await $`bun run cli.ts --help`.text()

  expect(result).toContain('Usage:')
  expect(result).toContain('Commands:')
  expect(result).toContain('Options:')
})

test('CLI version displays correctly', async () => {
  const result = await $`bun run cli.ts --version`.text()

  expect(result).toMatch(/\d+\.\d+\.\d+/)
})
```

## Testing Prompts

For interactive prompts, you can mock the prompt functions:

```ts
import { expect, mock, test } from 'bun:test'
import * as prompts from '@stacksjs/clapp'

test('setup wizard collects correct data', async () => {
  // Mock the prompts
  const textMock = mock(() => Promise.resolve('my-project'))
  const selectMock = mock(() => Promise.resolve('vue'))
  const confirmMock = mock(() => Promise.resolve(true))

  // Replace the actual prompts with mocks
  const originalText = prompts.text
  const originalSelect = prompts.select
  const originalConfirm = prompts.confirm

  ;(prompts as any).text = textMock
  ;(prompts as any).select = selectMock
  ;(prompts as any).confirm = confirmMock

  // Run your setup function
  const result = await runSetup()

  // Restore originals
  ;(prompts as any).text = originalText
  ;(prompts as any).select = originalSelect
  ;(prompts as any).confirm = originalConfirm

  // Verify results
  expect(result.name).toBe('my-project')
  expect(result.framework).toBe('vue')
  expect(result.confirmed).toBe(true)
})
```

## Snapshot Testing

Use snapshot testing for complex output:

```ts
import { expect, test } from 'bun:test'
import { CLI } from '@stacksjs/clapp'

test('help output matches snapshot', () => {
  const cli = new CLI('my-app')
    .version('1.0.0')
    .help()

  cli.command('build', 'Build the project')
  cli.command('serve', 'Start the server')

  const helpText = cli.getHelpText() // hypothetical method

  expect(helpText).toMatchSnapshot()
})
```

## Best Practices

### 1. Isolate Tests

Each test should be independent:

```ts
import { afterEach, beforeEach, test } from 'bun:test'

let cli: CLI

beforeEach(() => {
  cli = new CLI('test-app')
})

afterEach(() => {
  // Clean up any side effects
})
```

### 2. Test Edge Cases

```ts
test('handles empty arguments', () => {
  const cli = new CLI('test-app')
  cli.command('greet [name]', 'Greet')
     .action((name) => {
       expect(name).toBeUndefined()
     })

  cli.parse(['greet'])
})

test('handles special characters', () => {
  const cli = new CLI('test-app')
  cli.command('echo <message>', 'Echo message')
     .action((message) => {
       expect(message).toBe('Hello, World!')
     })

  cli.parse(['echo', 'Hello, World!'])
})
```

### 3. Test Help Output

```ts
test('displays help for command', () => {
  const output: string[] = []
  console.log = (msg: string) => output.push(msg)

  const cli = new CLI('test-app')
  cli.command('deploy', 'Deploy application')
     .option('-e, --env <env>', 'Environment')

  cli.parse(['deploy', '--help'])

  const helpText = output.join('\n')
  expect(helpText).toContain('deploy')
  expect(helpText).toContain('--env')
})
```

### 4. Test Exit Codes

```ts
import { expect, test } from 'bun:test'
import { $ } from 'bun'

test('exits with code 0 on success', async () => {
  const proc = Bun.spawn(['bun', 'run', 'cli.ts', 'build'])
  const exitCode = await proc.exited

  expect(exitCode).toBe(0)
})

test('exits with code 1 on error', async () => {
  const proc = Bun.spawn(['bun', 'run', 'cli.ts', 'invalid-command'])
  const exitCode = await proc.exited

  expect(exitCode).toBe(1)
})
```

## Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test cli.test.ts

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage
```

## Related

- [Getting Started](./getting-started.md) - Basic setup
- [Commands](./commands.md) - Command definition
- [Prompts](./prompts.md) - Interactive prompts
