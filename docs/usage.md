# Get Started

Learn how to create your first CLI application with clapp.

## Basic CLI Application

Creating a simple CLI application is straightforward:

```ts
import { cli } from '@stacksjs/clapp'

// Create a CLI application
const app = cli('mycli')
  .version('1.0.0')
  .help()

// Add a simple command
app.command('hello [name]', 'Say hello to someone')
  .action((name = 'world') => {
    console.log(`Hello, ${name}!`)
  })

// Run the CLI
await app.parse()
```

## Adding Interactive Prompts

Enhance your CLI with interactive prompts:

```ts
import { cli, text, select, multiselect } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

app.command('init', 'Initialize a new project')
  .action(async () => {
    // Ask for project name
    const name = await text({
      message: 'Project name:',
      defaultValue: 'my-app',
      validate: value => value.length > 0 || 'Name cannot be empty',
    })

    // Choose a template
    const template = await select({
      message: 'Select a template:',
      options: [
        { value: 'default', label: 'Default Project' },
        { value: 'api', label: 'API Service' },
        { value: 'fullstack', label: 'Full-Stack App' },
      ],
    })

    // Select features
    const features = await multiselect({
      message: 'Select features:',
      options: [
        { value: 'typescript', label: 'TypeScript' },
        { value: 'eslint', label: 'ESLint' },
        { value: 'testing', label: 'Testing' },
      ],
    })

    console.log(`Creating ${template} project: ${name}`)
    console.log(`Selected features: ${features.join(', ')}`)

    // Implementation would go here...
  })

await app.parse()
```

## Command Structure

Structure your commands for better organization:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

// Database commands with namespace
app.command('db:migrate', 'Run database migrations')
  .option('--dry-run', 'Show migrations without executing')
  .action((options) => {
    console.log(`Running migrations ${options.dryRun ? '(dry run)' : ''}`)
  })

app.command('db:seed', 'Seed the database')
  .action(() => {
    console.log('Seeding database')
  })

// Another top-level command
app.command('build', 'Build the project')
  .option('-m, --mode <mode>', 'Build mode', { default: 'production' })
  .action((options) => {
    console.log(`Building in ${options.mode} mode`)
  })

await app.parse()
```

## Using Styles

Enhance your CLI's appearance with styling:

```ts
import { cli, style } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

app.command('status', 'Show system status')
  .action(() => {
    console.log(style.bold.blue('System Status:'))
    console.log(`Database: ${style.green('Connected')}`)
    console.log(`API: ${style.yellow('Degraded')}`)
    console.log(`Cache: ${style.red('Offline')}`)

    console.log(`\n${style.bgBlue.white(' ACTIONS ')}`)
    console.log(`- Run ${style.cyan('mycli restart')} to restart services`)
    console.log(`- Run ${style.cyan('mycli logs')} to view logs`)
  })

await app.parse()
```

## Using Progress Indicators

Show progress for long-running tasks:

```ts
import { cli, spinner } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

app.command('install', 'Install dependencies')
  .action(async () => {
    // Create and start a spinner
    const spin = spinner()
    spin.start('Installing dependencies')

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update spinner text
    spin.message('Finalizing installation')

    // Simulate more work
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Complete the task
    spin.stop('Dependencies installed successfully')
  })

await app.parse()
```

## Global Options

Add global options that apply to all commands:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()
  .verbose()  // -v, --verbose
  .quiet()    // -q, --quiet
  .debug()    // --debug
  .dryRun()   // --dry-run

app.command('deploy', 'Deploy the application')
  .action(() => {
    if (app.isVerbose) {
      console.log('Verbose output enabled')
    }
    if (app.isDryRun) {
      console.log('[DRY RUN] Would deploy...')
      return
    }
    console.log('Deploying...')
  })

await app.parse()
```

## Building and Distribution

To build your CLI application for distribution:

```bash
# Build the project
bun run build

# Test your CLI locally
bun link
mycli --help
```

For more advanced usage, check out the [Commands](./commands) and [Prompts](./prompts) sections.
