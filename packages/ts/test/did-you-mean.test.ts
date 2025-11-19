import { describe, expect, it } from 'bun:test'
import { cli } from '../src'

describe('Did You Mean Suggestions', () => {
  it('should suggest similar commands for typos', async () => {
    const app = cli('test-app')

    app
      .command('build', 'Build the project')
      .action(() => {})

    app
      .command('test', 'Run tests')
      .action(() => {})

    app
      .command('lint', 'Lint code')
      .action(() => {})

    // Mock console.log to capture output
    const logs: string[] = []
    const originalLog = console.log
    const originalExit = process.exit

    console.log = (...args: any[]) => {
      logs.push(args.join(' '))
    }

    let exitCode: number | undefined
    // @ts-expect-error - mocking process.exit
    process.exit = (code?: number) => {
      exitCode = code
      throw new Error('process.exit called')
    }

    try {
      await app.parse(['node', 'test', 'buil'], { run: true })
    } catch (e: any) {
      // Expected to throw due to mocked process.exit
      if (e.message !== 'process.exit called') {
        throw e
      }
    } finally {
      console.log = originalLog
      process.exit = originalExit
    }

    // Verify error message was shown
    expect(logs.some(log => log.includes('Command "buil" not found'))).toBe(true)

    // Verify suggestions were shown
    expect(logs.some(log => log.includes('Did you mean one of these'))).toBe(true)
    expect(logs.some(log => log.includes('build'))).toBe(true)

    // Verify process.exit was called with error code
    expect(exitCode).toBe(1)
  })

  it('should not show suggestions if no similar commands found', async () => {
    const app = cli('test-app')

    app
      .command('build', 'Build the project')
      .action(() => {})

    const logs: string[] = []
    const originalLog = console.log
    const originalExit = process.exit

    console.log = (...args: any[]) => {
      logs.push(args.join(' '))
    }

    // @ts-expect-error - mocking process.exit
    process.exit = () => {
      throw new Error('process.exit called')
    }

    try {
      await app.parse(['node', 'test', 'xyz123'], { run: true })
    } catch (e: any) {
      if (e.message !== 'process.exit called') {
        throw e
      }
    } finally {
      console.log = originalLog
      process.exit = originalExit
    }

    // Should show error but no suggestions
    expect(logs.some(log => log.includes('Command "xyz123" not found'))).toBe(true)
    expect(logs.some(log => log.includes('Did you mean'))).toBe(false)
  })

  it('should allow disabling did you mean feature', async () => {
    const app = cli('test-app')
    app.didYouMean(false)

    app
      .command('build', 'Build the project')
      .action(() => {})

    const logs: string[] = []
    const originalLog = console.log
    const originalExit = process.exit

    console.log = (...args: any[]) => {
      logs.push(args.join(' '))
    }

    // @ts-expect-error - mocking process.exit
    process.exit = () => {
      throw new Error('process.exit called')
    }

    try {
      await app.parse(['node', 'test', 'buil'], { run: true })
    } catch (e: any) {
      if (e.message !== 'process.exit called') {
        throw e
      }
    } finally {
      console.log = originalLog
      process.exit = originalExit
    }

    // Should show error but no suggestions (disabled)
    expect(logs.some(log => log.includes('Command "buil" not found'))).toBe(true)
    expect(logs.some(log => log.includes('Did you mean'))).toBe(false)
  })

  it('should include command aliases in suggestions', async () => {
    const app = cli('test-app')

    app
      .command('test', 'Run tests')
      .alias('t')
      .action(() => {})

    const logs: string[] = []
    const originalLog = console.log
    const originalExit = process.exit

    console.log = (...args: any[]) => {
      logs.push(args.join(' '))
    }

    // @ts-expect-error - mocking process.exit
    process.exit = () => {
      throw new Error('process.exit called')
    }

    try {
      await app.parse(['node', 'test-app', 'ts'], { run: true })
    } catch (e: any) {
      if (e.message !== 'process.exit called') {
        throw e
      }
    } finally {
      console.log = originalLog
      process.exit = originalExit
    }

    // Should suggest both 'test' and 't' alias
    const output = logs.join(' ')
    expect(output.includes('Did you mean')).toBe(true)
    expect(output.includes('test') || output.includes(' t ')).toBe(true)
  })
})
