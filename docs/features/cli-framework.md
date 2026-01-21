# CLI Framework

clapp provides a powerful framework for building command-line interfaces with clean, intuitive syntax.

## Core Features

- **Elegant API**: Simple, chainable API for creating commands and options
- **Type Safety**: Built with TypeScript for type checking and autocompletion
- **Subcommands**: Create nested command hierarchies using namespaced commands
- **Input Validation**: Validate command arguments and options
- **Help Generation**: Automatic generation of help text and usage information
- **Error Handling**: Clean error reporting and "did you mean?" suggestions

## Creating a CLI Application

The foundation of any clapp application is the CLI object:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

// ... add commands here

await app.parse()
```

## Command Definition

Commands are the primary interface for users to interact with your application:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

// Basic command
app.command('hello', 'Say hello')
  .action(() => {
    console.log('Hello, world!')
  })

// Command with arguments
app.command('greet <name>', 'Greet a user')
  .action((name) => {
    console.log(`Hello, ${name}!`)
  })

await app.parse()
```

## Command Options

Customize command behavior with options:

```ts
app.command('build', 'Build the project')
  .option('-m, --mode <mode>', 'Build mode', { default: 'production' })
  .option('-w, --watch', 'Watch for changes')
  .option('-o, --output <dir>', 'Output directory')
  .action((options) => {
    console.log(`Building in ${options.mode} mode`)
    if (options.watch)
      console.log('Watching for changes...')
    if (options.output)
      console.log(`Output directory: ${options.output}`)
  })
```

## Namespaced Commands

Organize related commands using namespaces:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

// Database commands with namespace
app.command('db:migrate', 'Run database migrations')
  .action(() => {
    console.log('Running migrations...')
  })

app.command('db:seed', 'Seed database with data')
  .action(() => {
    console.log('Seeding database...')
  })

// Help output will group these under "db:"
await app.parse()
```

## Help and Documentation

clapp automatically generates help text for your commands:

```ts
// Default help command is available
// $ mycli --help
// $ mycli <command> --help

// You can add examples
app.command('hello', 'Say hello')
  .example('mycli hello')
  .example('mycli hello --uppercase')
```

## Error Handling

Handle errors gracefully:

```ts
import { cli, ClappError } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

app.command('read <file>', 'Read a file')
  .action((file) => {
    try {
      // Attempt to read file
      const contents = readFileSync(file, 'utf8')
      console.log(contents)
    }
    catch (err) {
      throw new ClappError(`Could not read file: ${file}`)
    }
  })
```

## Global Options

Define options that apply to all commands using built-in helpers:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()
  .verbose()  // -v, --verbose
  .quiet()    // -q, --quiet
  .debug()    // --debug
  .dryRun()   // --dry-run
  .force()    // -f, --force

// Commands can access global options via the app instance
app.command('process', 'Process something')
  .action((options) => {
    if (app.isVerbose) {
      console.log('Verbose mode enabled')
    }
    if (app.isDryRun) {
      console.log('[DRY RUN] Would process...')
      return
    }
    // Process command...
  })

await app.parse()
```

You can also add custom global options:

```ts
app.option('--config <path>', 'Path to config file')
```

## Lifecycle Hooks

Register hooks that run before or after command execution:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

app.command('deploy', 'Deploy the application')
  .before((context) => {
    console.log('Preparing deployment...')
  })
  .action(() => {
    console.log('Deploying...')
  })
  .after((context) => {
    console.log('Deployment complete!')
  })

await app.parse()
```

## Middleware

Use middleware for cross-cutting concerns:

```ts
app.command('deploy', 'Deploy the application')
  .use(async (context) => {
    console.log('Checking authentication...')
    await context.next()
    console.log('Done!')
  })
  .action(() => {
    console.log('Deploying...')
  })
```

## Signal Handling

Handle graceful shutdown:

```ts
const app = cli('mycli')
  .version('1.0.0')
  .help()
  .handleSignals(async () => {
    console.log('Cleaning up...')
    await cleanup()
  })
```

## Complete Example

Here's a more complete example showing various features:

```ts
import { cli } from '@stacksjs/clapp'

// Create the CLI application
const app = cli('mycli')
  .version('1.0.0')
  .help()
  .verbose()
  .debug()
  .dryRun()
  .handleSignals()

// Simple command
app.command('hello [name]', 'Say hello')
  .option('-u, --uppercase', 'Convert to uppercase')
  .action((name = 'world', options) => {
    let message = `Hello, ${name}!`
    if (options.uppercase) {
      message = message.toUpperCase()
    }
    console.log(message)
  })

// Namespaced commands
app.command('config:get <key>', 'Get a config value')
  .action((key) => {
    console.log(`Getting config for: ${key}`)
  })

app.command('config:set <key> <value>', 'Set a config value')
  .action((key, value) => {
    if (app.isDryRun) {
      console.log(`[DRY RUN] Would set ${key} to ${value}`)
      return
    }
    console.log(`Setting ${key} to ${value}`)
  })

// Run the application
await app.parse()
```

For more detailed information, check the [Commands](../commands) and [API Reference](../api/cli) sections.
