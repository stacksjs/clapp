import { describe, expect, it } from 'bun:test'
import { cli } from '../src'

describe('Verbose and Quiet Modes', () => {
  it('should enable verbose mode with -v flag', () => {
    const app = cli('test-app').verbose()

    app
      .command('build', 'Build the project')
      .action(() => {})

    app.parse(['node', 'test', 'build', '-v'], { run: true })

    expect(app.isVerbose).toBe(true)
    expect(app.isQuiet).toBe(false)
  })

  it('should enable verbose mode with --verbose flag', () => {
    const app = cli('test-app').verbose()

    app
      .command('build', 'Build the project')
      .action(() => {})

    app.parse(['node', 'test', 'build', '--verbose'], { run: true })

    expect(app.isVerbose).toBe(true)
    expect(app.isQuiet).toBe(false)
  })

  it('should enable quiet mode with -q flag', () => {
    const app = cli('test-app').quiet()

    app
      .command('build', 'Build the project')
      .action(() => {})

    app.parse(['node', 'test', 'build', '-q'], { run: true })

    expect(app.isQuiet).toBe(true)
    expect(app.isVerbose).toBe(false)
  })

  it('should enable quiet mode with --quiet flag', () => {
    const app = cli('test-app').quiet()

    app
      .command('build', 'Build the project')
      .action(() => {})

    app.parse(['node', 'test', 'build', '--quiet'], { run: true })

    expect(app.isQuiet).toBe(true)
    expect(app.isVerbose).toBe(false)
  })

  it('should support both verbose and quiet options together', () => {
    const app = cli('test-app').verbose().quiet()

    app
      .command('build', 'Build the project')
      .action(() => {})

    // Quiet takes precedence if both are set
    app.parse(['node', 'test', 'build', '-v', '-q'], { run: true })

    expect(app.isVerbose).toBe(true)
    expect(app.isQuiet).toBe(true)
  })

  it('should not enable verbose mode without the flag', () => {
    const app = cli('test-app').verbose()

    app
      .command('build', 'Build the project')
      .action(() => {})

    app.parse(['node', 'test', 'build'], { run: true })

    expect(app.isVerbose).toBe(false)
  })

  it('should not enable quiet mode without the flag', () => {
    const app = cli('test-app').quiet()

    app
      .command('build', 'Build the project')
      .action(() => {})

    app.parse(['node', 'test', 'build'], { run: true })

    expect(app.isQuiet).toBe(false)
  })

  it('should allow chaining methods', () => {
    const app = cli('test-app')
      .verbose()
      .quiet()
      .didYouMean()

    expect(app).toBeDefined()
  })
})
