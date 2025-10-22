import type { CLI } from './CLI'
import { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { MockReadable, MockWritable } from '../test/utils'
import { cli } from './CLI'

export interface TestContext {
  stdout: MockWritable
  stderr: MockWritable
  stdin: MockReadable
  originalExit: typeof process.exit
  originalStdout: typeof process.stdout
  originalStderr: typeof process.stderr
  originalStdin: typeof process.stdin
  originalConsoleLog: typeof console.log
}

export interface ExecCommandOptions {
  /** Array of inputs to provide to prompts */
  inputs?: string[]
  /** Environment variables to set during execution */
  env?: Record<string, string>
  /** Working directory for the command */
  cwd?: string
  /** Maximum time (ms) to wait for command completion */
  timeout?: number
}

export interface ExecCommandResult {
  /** Standard output content */
  stdout: string
  /** Standard error content */
  stderr: string
  /** Exit code of the command */
  exitCode: number
  /** Time taken to execute (ms) */
  duration: number
  /** All output chunks */
  outputs: string[]
  /** Return value from the action function */
  result: any
}

/**
 * Creates a test instance of a CLI application, enabling isolated testing without side effects.
 */
export function createTestCLI(options: Record<string, any> = {}): CLI {
  return cli(options.name || '')
}

/**
 * Prepares a CLI instance for testing by disabling process exits and redirecting outputs.
 */
export function setupTest(): TestContext {
  const stdout = new MockWritable()
  const stderr = new MockWritable()
  const stdin = new MockReadable()

  const originalExit = process.exit
  const originalStdout = process.stdout
  const originalStderr = process.stderr
  const originalStdin = process.stdin
  // eslint-disable-next-line no-console
  const originalConsoleLog = console.log

  // Mock process.exit
  process.exit = ((code?: number) => {
    throw new Error(`Process exit with code: ${code || 0}`)
  }) as typeof process.exit

  // Mock stdout, stderr and stdin
  Object.defineProperty(process, 'stdout', { value: stdout, writable: true })
  Object.defineProperty(process, 'stderr', { value: stderr, writable: true })
  Object.defineProperty(process, 'stdin', { value: stdin, writable: true })

  return {
    stdout,
    stderr,
    stdin,
    originalExit,
    originalStdout,
    originalStderr,
    originalStdin,
    originalConsoleLog,
  }
}

/**
 * Restore the process state after testing
 */
export function teardownTest(context: TestContext): void {
  process.exit = context.originalExit
  Object.defineProperty(process, 'stdout', { value: context.originalStdout, writable: true })
  Object.defineProperty(process, 'stderr', { value: context.originalStderr, writable: true })
  Object.defineProperty(process, 'stdin', { value: context.originalStdin, writable: true })
  // eslint-disable-next-line no-console
  console.log = context.originalConsoleLog
}

/**
 * Executes a command on the CLI instance and returns the result.
 */
export async function execCommand(
  cliInstance: CLI,
  argv: string[],
  options: ExecCommandOptions = {},
): Promise<ExecCommandResult> {
  const startTime = Date.now()
  const { inputs = [], env = {}, cwd = process.cwd(), timeout = 5000 } = options

  // Setup test environment
  const testContext = setupTest()
  const { stdin, stdout, stderr } = testContext

  // Check if this is a help command
  const isHelpCommand = argv.includes('--help') || argv.includes('-h')

  const capturedOutput: string[] = []

  // Override stdout.write to capture all output
  process.stdout.write = function (chunk: any) {
    const str = chunk.toString()
    capturedOutput.push(str)
    stdout.write(str)
    return true
  } as any

  // Override console.log to capture help output
  // eslint-disable-next-line no-console
  console.log = function (...args: any[]) {
    const str = args.map(arg => String(arg)).join(' ')
    capturedOutput.push(`${str}\n`)
    stdout.write(`${str}\n`)
    return undefined
  } as any

  // Prepare inputs if provided
  if (inputs.length > 0) {
    for (const input of inputs) {
      stdin.pushValue(`${input}\n`)
    }
  }

  // Save original environment and change directory
  const originalEnv = { ...process.env }
  const originalCwd = process.cwd()

  // Set environment variables
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value
  })

  // Change directory if specified
  if (cwd !== originalCwd) {
    process.chdir(cwd)
  }

  let result: any
  let exitCode = 0

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Command execution timed out')), timeout)
    })

    // Run the command
    const runPromise = Promise.resolve().then(async () => {
      try {
        // Force help option to not exit the process since we're in a test
        cliInstance.showHelpOnExit = false
        cliInstance.showVersionOnExit = false

        // Parse arguments and run command
        cliInstance.parse(['node', 'cli', ...argv])

        // If help flag is present, manually call help
        if (isHelpCommand) {
          cliInstance.outputHelp()
        }

        // Get the result from command execution
        result = cliInstance.runMatchedCommand()
        return result
      }
      catch (error: any) {
        exitCode = 1
        stderr.write(`${error}\n`)
        throw error
      }
    })

    // Race between command execution and timeout
    await Promise.race([runPromise, timeoutPromise])
  }
  catch (error: any) {
    if (error.message === 'Command execution timed out') {
      throw error
    }
    // Don't rethrow other errors since we handle them gracefully
  }
  finally {
    // Restore environment and directory
    process.env = originalEnv
    if (cwd !== originalCwd) {
      process.chdir(originalCwd)
    }

    // Restore process state
    teardownTest(testContext)
  }

  const duration = Date.now() - startTime

  // Help commands should always have exitCode 0
  if (isHelpCommand) {
    exitCode = 0
  }

  return {
    stdout: capturedOutput.join(''),
    stderr: stderr.buffer.join(''),
    exitCode,
    duration,
    outputs: [...capturedOutput],
    result,
  }
}

/**
 * Response map for mocking prompts
 */
export type PromptResponses = Record<string, string | boolean | number>
let mockPromptResponses: PromptResponses | null = null

/**
 * Mocks user responses to interactive prompts.
 */
export function mockPrompt(responses: PromptResponses): void {
  mockPromptResponses = responses
}

/**
 * Gets the mocked response for a prompt if available
 */
export function getMockResponse(prompt: string): any {
  if (!mockPromptResponses)
    return undefined

  // Check for exact match
  if (prompt in mockPromptResponses) {
    return mockPromptResponses[prompt]
  }

  // Check for pattern match
  for (const [key, value] of Object.entries(mockPromptResponses)) {
    if (key.startsWith('/') && key.endsWith('/i')) {
      const pattern = key.slice(1, -2)
      const regex = new RegExp(pattern, 'i')
      if (regex.test(prompt)) {
        return value
      }
    }
    else if (key.startsWith('/') && key.endsWith('/')) {
      const pattern = key.slice(1, -1)
      const regex = new RegExp(pattern)
      if (regex.test(prompt)) {
        return value
      }
    }
  }

  // Check for wildcard
  if ('*' in mockPromptResponses) {
    return mockPromptResponses['*']
  }

  return undefined
}

/**
 * Reset mock prompt responses
 */
export function resetMockPrompts(): void {
  mockPromptResponses = null
}

let captureInstance: {
  stdout: string[]
  stderr: string[]
  stop: () => { stdout: string, stderr: string }
} | null = null

/**
 * Captures all output during test execution.
 */
export function captureOutput(): {
  stdout: string[]
  stderr: string[]
  stop: () => { stdout: string, stderr: string }
} {
  const stdout: string[] = []
  const stderr: string[] = []

  const originalStdoutWrite = process.stdout.write
  const originalStderrWrite = process.stderr.write

  process.stdout.write = function (chunk: any) {
    stdout.push(chunk.toString())
    return true
  } as any

  process.stderr.write = function (chunk: any) {
    stderr.push(chunk.toString())
    return true
  } as any

  const instance = {
    stdout,
    stderr,
    stop: () => {
      process.stdout.write = originalStdoutWrite
      process.stderr.write = originalStderrWrite
      captureInstance = null
      return {
        stdout: stdout.join(''),
        stderr: stderr.join(''),
      }
    },
  }

  captureInstance = instance
  return instance
}

/**
 * Gets the most recent output from the test CLI.
 */
export function getLastOutput(): string {
  if (!captureInstance) {
    throw new Error('No output capture in progress. Call captureOutput() first.')
  }

  return captureInstance.stdout.join('')
}

/**
 * Creates a temporary test directory with the specified file structure.
 */
export async function createTestFS(
  structure: Record<string, any>,
): Promise<string> {
  const testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'clapp-test-'))

  const createNestedStructure = async (basePath: string, struct: Record<string, any>) => {
    for (const [key, value] of Object.entries(struct)) {
      const itemPath = path.join(basePath, key)

      if (typeof value === 'object' && !Buffer.isBuffer(value)) {
        // Directory with nested items
        if (key.endsWith('/')) {
          await fs.mkdir(itemPath, { recursive: true })
          await createNestedStructure(itemPath, value)
        }
        else {
          // It's a nested structure
          await fs.mkdir(itemPath, { recursive: true })
          await createNestedStructure(itemPath, value)
        }
      }
      else {
        // File with content
        const parentDir = path.dirname(itemPath)
        await fs.mkdir(parentDir, { recursive: true })

        if (Buffer.isBuffer(value)) {
          await fs.writeFile(itemPath, value)
        }
        else if (typeof value === 'string') {
          await fs.writeFile(itemPath, value, 'utf8')
        }
        else {
          await fs.writeFile(itemPath, JSON.stringify(value), 'utf8')
        }
      }
    }
  }

  await createNestedStructure(testDir, structure)
  return testDir
}

/**
 * Cleans up the test directory.
 */
export async function cleanupTestFS(testDir: string): Promise<void> {
  const deleteDirRecursive = async (dir: string) => {
    const items = await fs.readdir(dir, { withFileTypes: true })

    for (const item of items) {
      const itemPath = path.join(dir, item.name)

      if (item.isDirectory()) {
        await deleteDirRecursive(itemPath)
      }
      else {
        await fs.unlink(itemPath)
      }
    }

    await fs.rmdir(dir)
  }

  await deleteDirRecursive(testDir)
}
