import { describe, expect, it } from 'bun:test'
import { cli, execCommand } from '../src'

describe('Help Output', () => {
  it('prints a single compact help hint instead of re-listing every command', async () => {
    const app = cli('demo')

    app.command('daemon:start', 'Start daemon').action(() => {})
    app.command('daemon:stop', 'Stop daemon').action(() => {})
    app.command('watch:start <name>', 'Start watcher').action(() => {})
    app.command('serve', 'Start server').action(() => {})

    const result = await execCommand(app, ['--help'])

    // The compact hint appears exactly once
    expect(result.stdout).toContain('Run `demo <command> --help` for command details.')
    expect(result.stdout.split('for command details.').length - 1).toBe(1)

    // No per-command `$ demo <cmd> --help` re-listing
    expect(result.stdout).not.toContain('For more info')
    expect(result.stdout).not.toContain('$ demo daemon:start --help')
    expect(result.stdout).not.toContain('$ demo daemon:stop --help')
    expect(result.stdout).not.toContain('$ demo watch:start --help')
    expect(result.stdout).not.toContain('$ demo serve --help')

    // The grouped namespace listing stays intact, with fully qualified names
    expect(result.stdout).toContain('daemon:')
    expect(result.stdout).toContain('daemon:start')
    expect(result.stdout).toContain('daemon:stop')
    expect(result.stdout).toContain('watch:')
    expect(result.stdout).toContain('watch:start <name>')
    expect(result.stdout).toContain('serve')
  })

  it('sorts ungrouped commands alphabetically in the top section', async () => {
    const app = cli('demo')

    app.command('zebra', 'Z command').action(() => {})
    app.command('apple', 'A command').action(() => {})
    app.command('mango', 'M command').action(() => {})

    const result = await execCommand(app, ['--help'])

    const appleIdx = result.stdout.indexOf('apple')
    const mangoIdx = result.stdout.indexOf('mango')
    const zebraIdx = result.stdout.indexOf('zebra')

    expect(appleIdx).toBeGreaterThan(-1)
    expect(mangoIdx).toBeGreaterThan(-1)
    expect(zebraIdx).toBeGreaterThan(-1)
    expect(appleIdx).toBeLessThan(mangoIdx)
    expect(mangoIdx).toBeLessThan(zebraIdx)
  })

  it('shows a command-local option once when it overrides a global option', async () => {
    const app = cli('demo')
    app.option('-v, --verbose', 'Global verbose output')
    app.command('build', 'Build the project')
      .option('--verbose', 'Build diagnostics')
      .action(() => {})

    const result = await execCommand(app, ['build', '--help'])

    expect(result.stdout.match(/--verbose/g)).toHaveLength(1)
    expect(result.stdout).toContain('Build diagnostics')
    expect(result.stdout).not.toContain('Global verbose output')
  })
})
