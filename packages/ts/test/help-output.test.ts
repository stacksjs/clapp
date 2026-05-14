import { describe, expect, it } from 'bun:test'
import { cli, execCommand } from '../src'

describe('Help Output', () => {
  it('prints fully qualified namespaced command help hints', async () => {
    const app = cli('demo')

    app.command('daemon:start', 'Start daemon').action(() => {})
    app.command('daemon:stop', 'Stop daemon').action(() => {})
    app.command('watch:start <name>', 'Start watcher').action(() => {})

    const result = await execCommand(app, ['--help'])

    expect(result.stdout).toContain('$ demo daemon:start --help')
    expect(result.stdout).toContain('$ demo daemon:stop --help')
    expect(result.stdout).toContain('$ demo watch:start --help')
    expect(result.stdout).not.toContain('$ demo start --help')
  })
})
