import { version } from '../package.json'
import { CLI } from '../src'

const cli = new CLI('clapp')

interface CliOption {
  verbose: boolean
}

cli
  .command('start', 'Start the Reverse Proxy Server')
  .option('--verbose', 'Enable verbose logging')
  .example('reverse-proxy start --from localhost:5173 --to my-project.localhost')
  .action(async (options?: CliOption) => {
    console.log('Options:', options)
  })

cli.command('version', 'Show the version of the CLI').action(() => {
  console.log(version)
})

// Add a default command (empty name) that shows help
cli
  .command('', 'Show help information')
  .action(() => {
    cli.outputHelp()
  })

cli.version(version)
cli.help()
cli.parse()
