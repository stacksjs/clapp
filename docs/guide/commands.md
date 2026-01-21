---
title: Commands
description: Learn how to define commands, options, and arguments in clapp.
---

# Commands

Commands are the core building blocks of your CLI application. They define the actions users can perform.

## Defining Commands

Use the `command()` method to define a command:

```ts
import { CLI } from '@stacksjs/clapp'

const cli = new CLI('my-app')

cli
  .command('deploy', 'Deploy the application')
  .action(() => {
    console.log('Deploying...')
  })

cli.parse()
```

## Command Arguments

### Required Arguments

Use angle brackets `<arg>` for required arguments:

```ts
cli
  .command('greet <name>', 'Greet someone')
  .action((name) => {
    console.log(`Hello, ${name}!`)
  })

// Usage: my-app greet John
// Output: Hello, John!
```

### Optional Arguments

Use square brackets `[arg]` for optional arguments:

```ts
cli
  .command('greet [name]', 'Greet someone')
  .action((name) => {
    console.log(`Hello, ${name || 'World'}!`)
  })

// Usage: my-app greet
// Output: Hello, World!
```

### Variadic Arguments

Use `...` for variadic arguments (accepts multiple values):

```ts
cli
  .command('add <files...>', 'Add files to staging')
  .action((files) => {
    console.log('Adding files:', files.join(', '))
  })

// Usage: my-app add file1.ts file2.ts file3.ts
// Output: Adding files: file1.ts, file2.ts, file3.ts
```

## Command Options

### Boolean Options

Boolean options are flags that toggle behavior:

```ts
cli
  .command('build', 'Build the project')
  .option('-w, --watch', 'Watch for changes')
  .option('-m, --minify', 'Minify output')
  .action((options) => {
    if (options.watch) {
      console.log('Watching for changes...')
    }
    if (options.minify) {
      console.log('Minifying output...')
    }
  })

// Usage: my-app build --watch --minify
```

### Options with Values

Options can accept values:

```ts
cli
  .command('serve', 'Start the server')
  .option('-p, --port <port>', 'Port number')
  .option('-h, --host <host>', 'Host address')
  .action((options) => {
    console.log(`Server at ${options.host}:${options.port}`)
  })

// Usage: my-app serve --port 3000 --host localhost
```

### Default Values

Specify default values for options:

```ts
cli
  .command('serve', 'Start the server')
  .option('-p, --port <port>', 'Port number', { default: 3000 })
  .option('-h, --host <host>', 'Host address', { default: 'localhost' })
  .action((options) => {
    console.log(`Server at ${options.host}:${options.port}`)
  })

// Usage: my-app serve
// Output: Server at localhost:3000
```

### Required Options

Mark options as required:

```ts
cli
  .command('deploy', 'Deploy to environment')
  .option('-e, --env <environment>', 'Target environment', { required: true })
  .action((options) => {
    console.log(`Deploying to ${options.env}`)
  })

// Usage: my-app deploy --env production
```

## Subcommands

Create nested command structures:

```ts
const cli = new CLI('my-app')

// Define a parent command
const db = cli.command('db', 'Database operations')

// Add subcommands
db.command('migrate', 'Run migrations')
  .action(() => console.log('Running migrations...'))

db.command('seed', 'Seed the database')
  .action(() => console.log('Seeding...'))

db.command('reset', 'Reset the database')
  .option('-f, --force', 'Skip confirmation')
  .action((options) => {
    if (options.force) {
      console.log('Resetting database...')
    }
  })

cli.parse()

// Usage:
// my-app db migrate
// my-app db seed
// my-app db reset --force
```

## Command Aliases

Define aliases for commands:

```ts
cli
  .command('install', 'Install dependencies')
  .alias('i')
  .action(() => {
    console.log('Installing...')
  })

// Usage: my-app install OR my-app i
```

## Global Options

Define options that apply to all commands:

```ts
const cli = new CLI('my-app')
  .option('-v, --verbose', 'Enable verbose output')
  .option('-c, --config <file>', 'Config file path')

cli
  .command('build', 'Build the project')
  .action((options) => {
    if (options.verbose) {
      console.log('Verbose mode enabled')
    }
  })

cli.parse()
```

## Action Context

The action callback receives arguments and options:

```ts
cli
  .command('deploy <env>', 'Deploy to environment')
  .option('-t, --tag <tag>', 'Deploy specific tag')
  .option('-f, --force', 'Force deployment')
  .action((env, options) => {
    // env is the required argument
    // options contains all option values
    console.log(`Deploying ${options.tag || 'latest'} to ${env}`)
    if (options.force) {
      console.log('Force mode enabled')
    }
  })
```

## Help Text

clapp automatically generates help text:

```bash
$ my-app --help

my-app v1.0.0

Usage: my-app <command> [options]

Commands:
  deploy <env>   Deploy to environment
  serve          Start the server

Options:
  -v, --verbose  Enable verbose output
  -h, --help     Display help
  --version      Display version
```

## Examples

Define usage examples in your command:

```ts
cli
  .command('deploy <env>', 'Deploy to environment')
  .example('my-app deploy production')
  .example('my-app deploy staging --tag v1.2.3')
  .action((env) => {
    console.log(`Deploying to ${env}`)
  })
```

## Error Handling

Handle errors gracefully:

```ts
cli
  .command('deploy <env>', 'Deploy to environment')
  .action(async (env) => {
    try {
      await deploy(env)
      console.log('Deployment successful!')
    } catch (error) {
      console.error('Deployment failed:', error.message)
      process.exit(1)
    }
  })
```

## Async Actions

Actions can be asynchronous:

```ts
cli
  .command('fetch <url>', 'Fetch data from URL')
  .action(async (url) => {
    const response = await fetch(url)
    const data = await response.json()
    console.log(data)
  })

cli.parse()
```

## Next Steps

- Learn about [Interactive Prompts](./prompts.md)
- Set up [Testing](./testing.md) for your CLI
