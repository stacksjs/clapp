import type { CLI } from './CLI'
import process from 'node:process'

/**
 * Wire the canonical "unknown subcommand" handler for a command group.
 *
 * Without this helper, every CLI app that ships a top-level command
 * with subcommands ends up writing the same boilerplate:
 *
 * ```ts
 * cli.on('foo:*', () => {
 *   console.error('Invalid command:', cli.args.join(' '))
 *   process.exit(1)
 * })
 * ```
 *
 * Centralizing it here:
 *   1. Removes ~N copies of identical boilerplate across consumers
 *   2. Makes the message format consistent (and easy to update)
 *   3. Routes through exit code 64 (`EX_USAGE` per `<sysexits.h>`)
 *      so CI / shell scripts can branch on "user-error" vs
 *      "real failure" without parsing stderr
 *
 * @example
 * ```ts
 * import { cli, onUnknownSubcommand } from '@stacksjs/clapp'
 *
 * const buddy = cli('buddy')
 * buddy.command('queue', '...').action(...)
 * onUnknownSubcommand(buddy, 'queue')
 * ```
 */
export function onUnknownSubcommand(cliInstance: CLI, prefix: string): void {
  cliInstance.on(`${prefix}:*`, () => {
    const args = cliInstance.args ?? []
    process.stderr.write(
      `Unknown ${prefix} subcommand: ${[...args].join(' ')}\n`
      + `Run \`${cliInstance.name} ${prefix} --help\` to see available subcommands.\n`,
    )
    // 64 = EX_USAGE per <sysexits.h>. Distinct from 1 (general failure)
    // so CI / shell scripts can branch on "user-error" vs "real failure"
    // without parsing stderr.
    process.exit(64)
  })
}
