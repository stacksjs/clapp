# CLI API Reference

The `cli` module is the foundation of the clapp framework, providing methods for creating and configuring CLI applications.

## Creating a CLI Application

### cli(name?)

Creates a new CLI application instance.

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
```

#### Parameters

| Parameter | Type | Description | Default |
| --------- | ---- | ----------- | ------- |
| `name` | `string` | The name of the CLI application | `''` |

#### Returns

Returns a new CLI instance.

## CLI Instance Methods

### command(name, description?, config?)

Creates and registers a new command.

```ts
app.command('build', 'Build the project')
  .option('-w, --watch', 'Watch for changes')
  .action((options) => {
    console.log('Building...')
  })
```

#### Parameters

| Parameter | Type | Description | Default |
| --------- | ---- | ----------- | ------- |
| `name` | `string` | The command name | Required |
| `description` | `string` | Command description | `''` |
| `config` | `CommandConfig` | Command configuration | `{}` |

#### Returns

Returns the Command instance for chaining.

### parse(argv?, options?)

Parses the arguments and runs the matched command.

```ts
// Parse process.argv
await app.parse()

// Parse custom arguments
await app.parse(['build', '--watch'])

// Parse without running the action
await app.parse(['build'], { run: false })
```

#### Parameters

| Parameter | Type | Description | Default |
| --------- | ---- | ----------- | ------- |
| `argv` | `string[]` | The arguments to parse | `process.argv` |
| `options.run` | `boolean` | Whether to run the matched command | `true` |

#### Returns

Returns a Promise resolving to `{ args, options }`.

### version(version, flags?)

Sets the version and enables the version flag.

```ts
app.version('1.0.0')
app.version('1.0.0', '-V, --version') // custom flags
```

#### Parameters

| Parameter | Type | Description | Default |
| --------- | ---- | ----------- | ------- |
| `version` | `string` | The version string | Required |
| `flags` | `string` | Custom version flags | `'-v, --version'` |

#### Returns

Returns the CLI instance for chaining.

### help(callback?)

Enables the help flag and optionally customizes help output.

```ts
app.help()

// With custom callback
app.help((sections) => {
  // Modify sections array
  return sections
})
```

#### Parameters

| Parameter | Type | Description | Default |
| --------- | ---- | ----------- | ------- |
| `callback` | `HelpCallback` | Optional callback to customize help | `undefined` |

#### Returns

Returns the CLI instance for chaining.

### option(flags, description, config?)

Adds a global option available to all commands.

```ts
app.option('--config <path>', 'Path to config file')
app.option('--no-color', 'Disable colored output')
```

#### Parameters

| Parameter | Type | Description | Default |
| --------- | ---- | ----------- | ------- |
| `flags` | `string` | The option flags | Required |
| `description` | `string` | Option description | Required |
| `config` | `OptionConfig` | Option configuration | `{}` |

#### Returns

Returns the CLI instance for chaining.

### usage(text)

Sets the global usage text.

```ts
app.usage('<command> [options]')
```

#### Returns

Returns the CLI instance for chaining.

### example(example)

Adds a global example.

```ts
app.example('mycli build --watch')
app.example((bin) => `${bin} deploy --env production`)
```

#### Returns

Returns the CLI instance for chaining.

## Global Option Helpers

These methods add commonly-used global options with a single call.

### verbose()

Adds `-v, --verbose` flag. Sets `cli.isVerbose` when used.

```ts
app.verbose()

// In command action
if (app.isVerbose) {
  console.log('Detailed output...')
}
```

### quiet()

Adds `-q, --quiet` flag. Sets `cli.isQuiet` when used.

```ts
app.quiet()
```

### debug()

Adds `--debug` flag. Sets `cli.isDebug` when used.

```ts
app.debug()
```

### noInteraction()

Adds `-n, --no-interaction` flag for CI/CD environments. Sets `cli.isNoInteraction` when used.

```ts
app.noInteraction()
```

### env()

Adds `--env <environment>` option. Sets `cli.environment` when used.

```ts
app.env()

// In command action
console.log(`Deploying to ${app.environment}`)
```

### dryRun()

Adds `--dry-run` flag. Sets `cli.isDryRun` when used.

```ts
app.dryRun()
```

### force()

Adds `-f, --force` flag. Sets `cli.isForce` when used.

```ts
app.force()
```

### emoji()

Adds `--no-emoji` flag. Sets `cli.useEmoji` when used.

```ts
app.emoji()
```

### themes()

Adds `--theme <theme>` option. Sets `cli.theme` when used.

```ts
app.themes()
```

### cache()

Adds `--no-cache` flag. Sets `cli.isNoCache` when used.

```ts
app.cache()
```

## Signal Handling

### handleSignals(cleanup?)

Sets up graceful signal handling for SIGINT and SIGTERM.

```ts
app.handleSignals(async () => {
  console.log('Cleaning up...')
  await cleanup()
})
```

#### Parameters

| Parameter | Type | Description | Default |
| --------- | ---- | ----------- | ------- |
| `cleanup` | `() => void \| Promise<void>` | Optional cleanup function | `undefined` |

#### Returns

Returns the CLI instance for chaining.

### removeSignalHandlers()

Removes signal handlers registered by `handleSignals()`.

```ts
app.removeSignalHandlers()
```

#### Returns

Returns the CLI instance for chaining.

## Utility Methods

### didYouMean(enabled?)

Enables or disables "did you mean?" suggestions for unknown commands.

```ts
app.didYouMean(false) // disable suggestions
```

#### Returns

Returns the CLI instance for chaining.

### outputHelp()

Outputs the help message for the matched command or global help.

```ts
app.outputHelp()
```

### outputVersion()

Outputs the version number.

```ts
app.outputVersion()
```

### destroy()

Cleans up and destroys the CLI instance. Removes signal handlers and clears internal state.

```ts
app.destroy()
```

## CLI Instance Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `name` | `string` | The CLI application name |
| `commands` | `Command[]` | Registered commands |
| `args` | `string[]` | Parsed positional arguments |
| `options` | `ParsedOptions` | Parsed options |
| `matchedCommand` | `Command \| undefined` | The matched command |
| `isVerbose` | `boolean` | Whether verbose mode is enabled |
| `isQuiet` | `boolean` | Whether quiet mode is enabled |
| `isDebug` | `boolean` | Whether debug mode is enabled |
| `isNoInteraction` | `boolean` | Whether no-interaction mode is enabled |
| `environment` | `string \| undefined` | Target environment |
| `isDryRun` | `boolean` | Whether dry-run mode is enabled |
| `isForce` | `boolean` | Whether force mode is enabled |
| `useEmoji` | `boolean` | Whether emoji output is enabled |
| `theme` | `string \| undefined` | Active color theme |
| `isNoCache` | `boolean` | Whether caching is disabled |

## Usage Examples

### Basic CLI

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()

app.command('hello', 'Say hello')
  .action(() => {
    console.log('Hello, world!')
  })

await app.parse()
```

### CLI with Global Options

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()
  .verbose()
  .quiet()
  .debug()

app.command('build', 'Build the project')
  .option('-w, --watch', 'Watch for changes')
  .action((options) => {
    if (app.isVerbose) {
      console.log('Verbose mode enabled')
    }
    if (app.isDebug) {
      console.log('Debug mode enabled')
    }
    console.log('Building project...')
  })

await app.parse()
```

### CLI with Signal Handling

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()
  .handleSignals(async () => {
    console.log('Gracefully shutting down...')
    // Clean up resources
  })

app.command('serve', 'Start the server')
  .action(async () => {
    console.log('Server running. Press Ctrl+C to stop.')
    // Long-running server
  })

await app.parse()
```

### Complete Example

```ts
import { cli } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')
  .help()
  .verbose()
  .quiet()
  .debug()
  .dryRun()
  .force()
  .env()
  .noInteraction()
  .handleSignals()

app.command('deploy', 'Deploy the application')
  .option('-t, --target <target>', 'Deployment target')
  .before((context) => {
    if (app.isDryRun) {
      console.log('[DRY RUN] Would deploy to:', context.options.target)
    }
  })
  .action((options) => {
    const env = app.environment || 'production'
    console.log(`Deploying to ${env}...`)
  })

await app.parse()
```
