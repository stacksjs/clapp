# Configuration

Clapp provides various ways to configure your CLI application behavior through chainable methods and runtime options.

## Application Configuration

Create a CLI application using the `cli()` function with an optional name parameter:

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()
```

### Setting Version and Help

```ts
const app = cli('mycli')
  .version('1.0.0')                    // Enables -v, --version
  .version('1.0.0', '-V, --version')   // Custom version flags
  .help()                              // Enables -h, --help
  .help((sections) => {                // Custom help callback
    // Modify help sections
    return sections
  })
```

### Usage and Examples

```ts
const app = cli('mycli')
  .usage('<command> [options]')
  .example('mycli build --watch')
  .example((bin) => `${bin} deploy --env production`)
```

## Global Options

### Built-in Option Helpers

Clapp provides convenient methods to add commonly-used global options:

```ts
const app = cli('mycli')
  .verbose()       // -v, --verbose    Sets app.isVerbose
  .quiet()         // -q, --quiet      Sets app.isQuiet
  .debug()         // --debug          Sets app.isDebug
  .dryRun()        // --dry-run        Sets app.isDryRun
  .force()         // -f, --force      Sets app.isForce
  .noInteraction() // -n, --no-interaction  Sets app.isNoInteraction
  .env()           // --env <env>      Sets app.environment
  .emoji()         // --no-emoji       Sets app.useEmoji
  .themes()        // --theme <theme>  Sets app.theme
  .cache()         // --no-cache       Sets app.isNoCache
```

### Custom Global Options

Add your own global options that apply to all commands:

```ts
const app = cli('mycli')
  .option('--config <path>', 'Path to config file')
  .option('--no-color', 'Disable colored output')
  .option('-o, --output <dir>', 'Output directory', './dist')
```

## Command Configuration

### Basic Command Setup

```ts
app.command('build', 'Build the project')
  .option('-w, --watch', 'Watch for changes')
  .option('-m, --mode <mode>', 'Build mode', 'development')
  .action((options) => {
    console.log(`Building in ${options.mode} mode`)
  })
```

### Command with Arguments

```ts
app.command('greet <name>', 'Greet someone')
  .option('-l, --loud', 'Use uppercase')
  .action((name, options) => {
    const greeting = options.loud ? name.toUpperCase() : name
    console.log(`Hello, ${greeting}!`)
  })
```

### Command Configuration Options

```ts
app.command('deploy', 'Deploy application', {
  allowUnknownOptions: true,      // Don't error on unknown options
  ignoreOptionDefaultValue: true, // Ignore default values from global options
})
```

### Command Aliases

```ts
app.command('install', 'Install dependencies')
  .alias('i')
  .alias('add')
```

## Lifecycle Hooks

### Before and After Hooks

```ts
app.command('deploy')
  .before((context) => {
    console.log('Pre-deployment checks...')
  })
  .action(() => {
    console.log('Deploying...')
  })
  .after((context) => {
    console.log('Deployment complete!')
  })
```

### Middleware

```ts
app.command('deploy')
  .use(async (context) => {
    console.log('Checking authentication...')
    await context.next()
    console.log('Done!')
  })
  .use(async (context) => {
    console.log('Validating config...')
    await context.next()
  })
  .action(() => {
    console.log('Deploying...')
  })
```

## Signal Handling

Configure graceful shutdown handling:

```ts
const app = cli('mycli')
  .handleSignals(async () => {
    console.log('Cleaning up...')
    await cleanup()
  })
```

## "Did You Mean" Suggestions

Enable or disable command suggestions for typos:

```ts
const app = cli('mycli')
  .didYouMean(true)  // enabled by default
  .didYouMean(false) // disable suggestions
```

## Environment Variables

Clapp respects certain environment variables:

| Variable | Description |
| -------- | ----------- |
| `NO_COLOR` | If set, disables color output |
| `FORCE_COLOR` | If set to `1`, `2`, or `3`, forces color output |
| `CI` | If set, adjusts behavior for CI environments |
| `DO_NOT_TRACK` | If set to `1`, disables telemetry |
| `NO_TELEMETRY` | If set to `1`, disables telemetry |

Example:

```bash
# Disable color output
NO_COLOR=1 mycli build

# Force color output level 3 (true color)
FORCE_COLOR=3 mycli build

# Disable telemetry
DO_NOT_TRACK=1 mycli build
```

## Runtime State

Access CLI state in your command actions:

```ts
app.command('deploy')
  .action((options) => {
    // Access global option states
    if (app.isVerbose) {
      console.log('Verbose output enabled')
    }

    if (app.isDryRun) {
      console.log('[DRY RUN] Would deploy...')
      return
    }

    if (app.isNoInteraction) {
      console.log('Running in non-interactive mode')
    }

    const env = app.environment || 'production'
    console.log(`Deploying to ${env}...`)
  })
```

## Cache Configuration

The built-in cache can be controlled programmatically:

```ts
import { cliCache } from '@stacksjs/clapp'

// Disable caching
cliCache.disable()

// Re-enable caching
cliCache.enable()

// Check cache stats
const stats = cliCache.stats()
console.log(`Cache: ${stats.size} entries, ${stats.hits} hits, ${stats.misses} misses`)
```

## Telemetry Configuration

Configure the opt-in telemetry system:

```ts
import { telemetry } from '@stacksjs/clapp'

// Enable telemetry (opt-in)
await telemetry.enable()

// Disable telemetry
await telemetry.disable()

// Check status
const status = await telemetry.status()
console.log(`Telemetry enabled: ${status.enabled}`)
```

## Complete Example

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  // Version and help
  .version('1.0.0')
  .help()

  // Global options
  .verbose()
  .quiet()
  .debug()
  .dryRun()
  .force()
  .env()
  .noInteraction()

  // Signal handling
  .handleSignals(async () => {
    console.log('Shutting down gracefully...')
  })

// Define commands
app.command('build', 'Build the project')
  .option('-w, --watch', 'Watch mode')
  .option('-m, --mode <mode>', 'Build mode', 'development')
  .before((ctx) => {
    if (app.isVerbose) {
      console.log('Starting build with options:', ctx.options)
    }
  })
  .action((options) => {
    if (app.isDryRun) {
      console.log('[DRY RUN] Would build in', options.mode, 'mode')
      return
    }
    console.log(`Building in ${options.mode} mode...`)
  })

app.command('deploy', 'Deploy the application')
  .option('-t, --target <target>', 'Deploy target')
  .use(async (ctx) => {
    console.log('Checking permissions...')
    await ctx.next()
  })
  .action((options) => {
    const env = app.environment || 'production'
    console.log(`Deploying to ${env}...`)
  })

// Run the CLI
await app.parse()
```
