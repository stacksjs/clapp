# Clapp Testing Utilities

This module provides utilities for testing CLI applications built with Clapp.

## Installation

```bash
bun install @stacksjs/clapp
```

## Usage

You can import the testing utilities from the package:

```ts
// ESM
import { createTestCLI, execCommand } from '@stacksjs/clapp'

// CommonJS
const { createTestCLI, execCommand } = require('@stacksjs/clapp')
```

## API Reference

### Core Testing Functions

#### `createTestCLI(options)`

Creates a test instance of a CLI application, enabling isolated testing without side effects.

```ts
const testCLI = createTestCLI({
  name: 'test-cli',
  version: '1.0.0',
})

// Add commands and options
testCLI.command('greet')
  .option('-n, --name <name>', 'Name to greet')
  .action(({ name }) => `Hello, ${name || 'world'}!`)
```

#### `setupTest()`

Prepares a CLI instance for testing by disabling process exits and redirecting outputs.

```ts
import { cli, setupTest } from '@stacksjs/clapp'

// Create a regular CLI instance
const myCLI = cli({
  name: 'my-cli',
  version: '1.0.0',
})

// Setup the CLI for testing
const testContext = setupTest()

// ...
```

#### `execCommand(cli, argv, options?)`

Executes a command on the CLI instance and returns the result.

```ts
// Execute a command
const result = await execCommand(testCLI, ['greet', '--name', 'Alice'])

// Verify the output
expect(result.stdout).toContain('Hello, Alice!')
expect(result.exitCode).toBe(0)
```

Options:

| Option | Type | Description | Default |
| ------ | ---- | ----------- | ------- |
| `inputs` | `string[]` | Array of inputs to provide to prompts | `[]` |
| `env` | `Record<string, string>` | Environment variables to set during execution | `{}` |
| `cwd` | `string` | Working directory for the command | `process.cwd()` |
| `timeout` | `number` | Maximum time (ms) to wait for command completion | `5000` |

Return Value:

| Property | Type | Description |
| -------- | ---- | ----------- |
| `stdout` | `string` | Standard output content |
| `stderr` | `string` | Standard error content |
| `exitCode` | `number` | Exit code of the command |
| `duration` | `number` | Time taken to execute (ms) |
| `outputs` | `string[]` | All output chunks |
| `result` | `any` | Return value from the action function |

### Output Capture

#### `captureOutput()`

Captures all output during test execution.

```ts
// Start capturing output
const capture = captureOutput()

// Run some code that generates output
await testCLI.run(['greet', '--name', 'Bob'])

// Stop capturing and get results
const output = capture.stop()

// Verify outputs
expect(output.stdout).toContain('Hello, Bob!')
expect(output.stderr).toBeEmpty()
```

#### `getLastOutput()`

Gets the most recent output from the test CLI.

```ts
// Execute a command
await testCLI.run(['greet', '--name', 'Charlie'])

// Get the last output
const lastOutput = getLastOutput()

// Verify the output
expect(lastOutput).toContain('Hello, Charlie!')
```

### Prompt Mocking

#### `mockPrompt(responses)`

Mocks user responses to interactive prompts.

```ts
// Mock user responses for prompts
mockPrompt({
  // Respond to specific prompts
  'What is your name?': 'Alice',
  'Confirm action?': true,

  // Or use patterns
  '/password/i': 'secret123',

  // Or use defaults for all unconfigured prompts
  '*': 'default response',
})

// Execute a command with interactive prompts
const result = await execCommand(testCLI, ['interactive'])
```

### Filesystem Testing

#### `createTestFS(structure)`

Creates a temporary test directory with the specified file structure.

```ts
// Create a temporary test directory
const testDir = await createTestFS({
  'config.json': JSON.stringify({ name: 'test' }),
  'src/': {
    'index.js': 'console.log("Hello")',
  },
})
```

#### `cleanupTestFS(testDir)`

Cleans up the test directory.

```ts
// Clean up the test directory
await cleanupTestFS(testDir)
```

## Examples

### Basic Command Testing

```ts
import { createTestCLI, execCommand } from '@stacksjs/clapp'
import { expect, test } from 'vitest'

test('greet command should work with name option', async () => {
  const testCLI = createTestCLI({ name: 'test-cli' })

  testCLI.command('greet')
    .option('-n, --name <name>', 'Name to greet')
    .action(({ name }) => `Hello, ${name || 'world'}!`)

  const result = await execCommand(testCLI, ['greet', '--name', 'Alice'])

  expect(result.stdout).toContain('Hello, Alice!')
  expect(result.exitCode).toBe(0)
})
```

### Testing Prompts

```ts
import { createTestCLI, execCommand, prompt } from '@stacksjs/clapp'
import { expect, test } from 'vitest'

test('interactive command with prompts', async () => {
  const testCLI = createTestCLI({ name: 'test-cli' })

  testCLI.command('interactive')
    .action(async () => {
      const name = await prompt.text('What is your name?')
      const age = await prompt.number('How old are you?')
      return `Hello, ${name}! You are ${age} years old.`
    })

  const result = await execCommand(testCLI, ['interactive'], {
    inputs: ['Alice', '30'],
  })

  expect(result.stdout).toContain('Hello, Alice! You are 30 years old.')
})
```

### Testing Filesystem Operations

```ts
import fs from 'node:fs/promises'
import path from 'node:path'
import { cleanupTestFS, createTestCLI, createTestFS, execCommand } from '@stacksjs/clapp'
import { afterEach, beforeEach, expect, test } from 'vitest'

let testDir
let testCLI

beforeEach(async () => {
  // Create a temporary test directory
  testDir = await createTestFS({
    'config.json': JSON.stringify({ name: 'test' }),
  })

  // Create a CLI that manipulates files
  testCLI = createTestCLI({ name: 'file-cli' })

  testCLI.command('read <file>')
    .action(async ({ file }) => {
      const content = await fs.readFile(path.join(testDir, file), 'utf-8')
      return content
    })
})

afterEach(async () => {
  // Clean up the test directory
  await cleanupTestFS(testDir)
})

test('read command should read file content', async () => {
  const result = await execCommand(testCLI, ['read', 'config.json'], {
    cwd: testDir,
  })

  expect(result.stdout).toContain('{"name":"test"}')
  expect(result.exitCode).toBe(0)
})
```

## License

MIT
