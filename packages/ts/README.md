# @stacksjs/clapp

An elegant, TypeScript-first CLI framework built on Bun for creating beautiful command-line applications with interactive prompts.

## Installation

```bash
bun add @stacksjs/clapp -d
# or
npm install @stacksjs/clapp --save-dev
```

## Usage

### Interactive Prompts

Create beautiful, interactive command-line experiences with pre-styled prompt components:

```typescript
import { confirm, intro, multiselect, outro, select, spinner, text } from '@stacksjs/clapp'

intro('Project Setup Wizard')

const name = await text({
  message: 'What is your project name?',
  placeholder: 'my-awesome-project',
  validate(value) {
    if (value.length === 0)
      return 'Name is required!'
  },
})

const useTypeScript = await confirm({
  message: 'Do you want to use TypeScript?',
})

const framework = await select({
  message: 'Select a framework:',
  options: [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue', hint: 'recommended' },
    { value: 'svelte', label: 'Svelte' },
  ],
})

const features = await multiselect({
  message: 'Select additional features:',
  options: [
    { value: 'router', label: 'Router' },
    { value: 'state', label: 'State Management' },
    { value: 'testing', label: 'Testing' },
  ],
  required: false,
})

const s = spinner()
s.start('Installing dependencies')
await new Promise(resolve => setTimeout(resolve, 2000))
s.stop('Installation complete!')

outro('You are all set!')
```

### CLI Framework

Build robust command-line applications with an elegant API:

```typescript
import { CLI } from '@stacksjs/clapp'

const cli = new CLI('greet')
  .version('1.0.0')
  .help()

cli.command('hello <name>', 'Greet a user')
  .option('--shout', 'Uppercase the greeting')
  .action((name, opts) => {
    const line = `Hello, ${name}!`
    console.log(opts.shout ? line.toUpperCase() : line)
  })

// `run()` catches usage errors (unknown flags, missing args), prints a
// friendly message, and exits with code 2. Non-usage errors propagate.
await cli.run()
```

### Usage-error handling

Running `greet hello --nope` prints:

```
greet: Unknown option `--nope`

Run `greet hello --help` to see available options.
```

…and exits with code `2` — no stack trace.

Three levels of integration:

```typescript
// 1. Highest level — `run()` handles usage errors for you.
await cli.run()

// 2. Same behaviour as an option on `parse()`.
await cli.parse(process.argv, { exitOnError: true })

// 3. DIY — catch and delegate to the same renderer.
try {
  await cli.parse(process.argv)
}
catch (err) {
  cli.handleUsageError(err)  // prints + exits for ClappError usage errors
  throw err                  // rethrows non-usage errors
}
```

`ClappError` instances expose:

- `isUsageError: boolean` — `true` for "the user typed it wrong", `false` for internal failures.
- `exitCode: number` — defaults to `2` for usage errors; override for specific error classes.

### Telemetry

Optional telemetry support for tracking CLI usage:

```typescript
import { createTelemetry } from '@stacksjs/clapp/telemetry'

const telemetry = createTelemetry({
  // configuration
})
```

## Features

- Beautiful interactive prompts (text, confirm, select, multiselect, spinner)
- Powerful CLI command framework
- TypeScript-first with full type safety
- Bun-powered for fast execution
- Optional telemetry support

## License

MIT
