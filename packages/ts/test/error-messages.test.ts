import { describe, expect, it } from 'bun:test'
import { cli } from '../src'

describe('Improved Error Messages', () => {
  it('should show helpful error for missing required arguments', async () => {
    const app = cli('test-app')

    app
      .command('deploy <environment> <region>', 'Deploy the application')
      .action(() => {})

    const logs: string[] = []
    const originalError = console.error
    console.error = (...args: any[]) => {
      logs.push(args.join(' '))
    }

    try {
      await app.parse(['node', 'test', 'deploy'], { run: true })
    }
    catch (error: any) {
      // Expected to throw
      expect(error.message).toContain('Missing required argument')
      expect(error.message).toContain('<environment> <region>')
      expect(error.message).toContain('--help')
    }
    finally {
      console.error = originalError
    }
  })

  it('should suggest similar options for typos', async () => {
    const app = cli('test-app')

    app
      .command('build', 'Build the project')
      .option('--output <dir>', 'Output directory')
      .option('--verbose', 'Verbose output')
      .action(() => {})

    try {
      await app.parse(['node', 'test', 'build', '--verbos'], { run: true })
    }
    catch (error: any) {
      // Should suggest --verbose
      expect(error.message).toContain('Unknown option')
      expect(error.message).toContain('Did you mean')
      expect(error.message).toContain('verbose')
      expect(error.message).toContain('--help')
    }
  })

  it('should show helpful error for missing option value', async () => {
    const app = cli('test-app')

    app
      .command('deploy', 'Deploy the application')
      .option('--env <environment>', 'Environment to deploy to')
      .action(() => {})

    try {
      await app.parse(['node', 'test', 'deploy', '--env'], { run: true })
    }
    catch (error: any) {
      expect(error.message).toContain('requires a value')
      expect(error.message).toContain('--env')
      expect(error.message).toContain('Example:')
    }
  })
})

describe('Signal Handling', () => {
  it('should allow setting up signal handlers', () => {
    const app = cli('test-app')

    const cleanup = () => {
      // Cleanup function
    }

    app.handleSignals(cleanup)

    // Verify handler was set (we can't easily test SIGINT in a test environment)
    expect(app.signalHandlersSet).toBe(true)
  })

  it('should not set signal handlers twice', () => {
    const app = cli('test-app')

    app.handleSignals()
    const result = app.handleSignals()

    // Should return this for chaining
    expect(result).toBe(app)
    expect(app.signalHandlersSet).toBe(true)
  })
})
