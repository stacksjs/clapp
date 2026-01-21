# Creating Commands

This guide covers advanced techniques for creating and managing commands in your clapp applications.

## Command Architecture

Understanding the architecture behind clapp commands will help you build more sophisticated CLI applications.

### Command Lifecycle

Each command goes through a lifecycle:

1. **Registration**: Command is defined and registered with the CLI
2. **Parsing**: Command arguments and options are parsed
3. **Validation**: Inputs are validated against defined rules
4. **Execution**: Command action is executed with provided inputs
5. **Completion**: Command completes and returns results

## Advanced Arguments

### Variadic Arguments

Collect multiple arguments with variadic parameters:

```ts
command('install')
  .description('Install packages')
  .argument('<...packages>', 'Packages to install')
  .action((packages) => {
    console.log(`Installing packages: ${packages.join(', ')}`)
  })
```

### Typed Arguments

Define argument types for automatic conversion and validation:

```ts
command('launch')
  .description('Launch application')
  .argument('<port:number>', 'Port to listen on')
  .argument('[hostname:string]', 'Hostname', 'localhost')
  .action((port, hostname) => {
    // port is automatically converted to a number
    console.log(`Launching on ${hostname}:${port}`)
  })
```

## Advanced Options

### Negatable Options

Create options that can be negated:

```ts
command('build')
  .description('Build the project')
  .option('--minify/--no-minify', 'Minify output', true)
  .action((options) => {
    console.log(`Minification: ${options.minify ? 'enabled' : 'disabled'}`)
  })
```

### Option Choices

Restrict option values to a predefined set:

```ts
command('deploy')
  .description('Deploy application')
  .option('-e, --environment <env>', 'Deployment environment', {
    choices: ['development', 'staging', 'production'],
    default: 'development',
  })
  .action((options) => {
    console.log(`Deploying to ${options.environment}`)
  })
```

### Coercion

Convert option values to specific types:

```ts
command('resize')
  .description('Resize image')
  .option('-w, --width <width>', 'Width in pixels', {
    coerce: value => Number.parseInt(value, 10),
  })
  .option('-h, --height <height>', 'Height in pixels', {
    coerce: value => Number.parseInt(value, 10),
  })
  .action((options) => {
    // options.width and options.height are numbers
    console.log(`Resizing to ${options.width}x${options.height}`)
  })
```

### Option Validation

Validate options in your action or with middleware:

```ts
command('deploy')
  .description('Deploy application')
  .option('-e, --environment <env>', 'Deployment environment')
  .option('-c, --config <path>', 'Config file')
  .before((context) => {
    // Validate that --environment is provided when --config is used
    if (context.options.config && !context.options.environment) {
      console.error('Error: --environment is required when using --config')
      process.exit(1)
    }
  })
  .action((options) => {
    console.log(`Deploying with config: ${options.config}`)
  })
```

## Command Groups

### Command Group Structure

Create hierarchical command structures:

```ts
// Main parent command
const db = command('db')
  .description('Database operations')

// First-level subcommands
db.command('migrate')
  .description('Database migrations')

db.command('seed')
  .description('Seed database')

// Second-level subcommands
const migrateCmd = db.commands.find(cmd => cmd.name === 'migrate')
migrateCmd.command('up')
  .description('Run migrations')

migrateCmd.command('down')
  .description('Rollback migrations')
```

### Shared Options

Share options across related commands using helper functions or global options:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()
  // Add global verbose option available to all commands
  .verbose()

// Both commands have access to app.isVerbose
app.command('build', 'Build project')
  .action((options) => {
    if (app.isVerbose)
      console.log('Verbose mode enabled for build')
    // Build logic...
  })

app.command('deploy', 'Deploy project')
  .action((options) => {
    if (app.isVerbose)
      console.log('Verbose mode enabled for deploy')
    // Deploy logic...
  })
```

You can also create helper functions to add common options:

```ts
// Helper to add common options
function withCommonOptions(cmd) {
  return cmd
    .option('-o, --output <dir>', 'Output directory')
    .option('--config <path>', 'Config file path')
}

const buildCmd = app.command('build', 'Build project')
withCommonOptions(buildCmd)
  .action((options) => {
    console.log('Output:', options.output)
  })
```

## Command Middleware

Use middleware to run code before or after commands:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

app.command('deploy', 'Deploy application')
  // Middleware wraps command execution
  .use(async (context) => {
    console.log('Checking authentication...')
    const isAuthenticated = true

    if (isAuthenticated) {
      // Continue to the next middleware or action
      await context.next()
    }
    else {
      console.error('Authentication failed')
      process.exit(1)
    }
  })
  // Add another middleware for timing
  .use(async (context) => {
    const start = Date.now()
    await context.next()
    const end = Date.now()
    console.log(`Command executed in ${end - start}ms`)
  })
  .action(() => {
    console.log('Deploying application...')
  })

await app.parse()
```

## Dynamic Commands

Create commands dynamically at runtime:

```ts
import * as fs from 'node:fs'
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

// Generate commands from configuration
function loadCommands() {
  const config = JSON.parse(fs.readFileSync('./commands.json', 'utf8'))

  config.commands.forEach((cmd) => {
    app.command(cmd.name, cmd.description)
      .action(() => {
        console.log(`Executing ${cmd.name}: ${cmd.script}`)
        // Execute cmd.script
      })
  })
}

loadCommands()
await app.parse()
```

## Command Aliases

Create aliases for commonly used commands:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

app.command('install', 'Install dependencies')
  .alias('i') // shorthand alias
  .action(() => {
    console.log('Installing dependencies...')
  })

// Users can now use either:
// $ mycli install
// $ mycli i

await app.parse()
```

## Command Hooks

Register hooks that run at different points in the command lifecycle:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

app.command('deploy', 'Deploy application')
  .before((context) => {
    console.log('Before deploy...')
    // Run setup tasks
  })
  .after((context) => {
    console.log('After deploy...')
    // Run cleanup tasks
  })
  .action(() => {
    console.log('Deploying application...')
  })

await app.parse()
```

## Command Composition

Compose complex commands from smaller, reusable parts:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

// Reusable command parts
function withVerboseOption(cmd) {
  return cmd.option('-v, --verbose', 'Enable verbose output')
}

function withForceOption(cmd) {
  return cmd.option('-f, --force', 'Force operation without confirmation')
}

function withLogging(cmd) {
  return cmd
    .before((context) => {
      console.log(`Running command...`)
    })
    .after((context) => {
      console.log(`Command completed`)
    })
}

// Create a command with composition
const buildCmd = app.command('build', 'Build the project')
  .action((options) => {
    console.log(`Building with options:`, options)
  })

// Apply composable parts
withVerboseOption(buildCmd)
withForceOption(buildCmd)
withLogging(buildCmd)

await app.parse()
```

## Error Handling

Handle command errors gracefully:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

app.command('risky', 'Run a risky operation')
  .action(async () => {
    try {
      // Attempt risky operation
      const result = await riskyOperation()
      console.log('Operation succeeded:', result)
    }
    catch (err) {
      // Handle specific errors
      if (err.code === 'NETWORK_ERROR') {
        console.error('Network error occurred. Check your connection.')
        process.exit(1)
      }

      // Handle other errors
      console.error('An unexpected error occurred:', err.message)
      process.exit(1)
    }
  })

await app.parse()
```

## Command Customization

Customize command appearance and behavior:

```ts
import { cli, command, style } from '@stacksjs/clapp'

const app = cli({
  name: 'mycli',
})

command('status')
  .description('Show system status')
  .help({
    header: style.blue('STATUS COMMAND'),
    usage: 'mycli status [options]',
    examples: [
      'mycli status',
      'mycli status --json',
      'mycli status --detailed',
    ],
    footer: style.dim('For more information, visit our docs.'),
  })
  .action(() => {
    console.log('System is running')
  })
```

For more information, see the [Commands API Reference](../api/command).
