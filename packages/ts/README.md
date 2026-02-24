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
import { command, run } from '@stacksjs/clapp'

command('greet')
  .description('Greet a user')
  .option('-n, --name <name>', 'Name to greet', { default: 'World' })
  .action((options) => {
    console.log(`Hello, ${options.name}!`)
  })

run()
```

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
