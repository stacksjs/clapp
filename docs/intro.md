# Introduction to clapp

<p align="center"><img src="https://github.com/stacksjs/clapp/blob/main/.github/art/cover.jpg?raw=true" alt="Social Card of clapp"></p>

## What is clapp?

clapp is an elegant, TypeScript-first CLI framework built on Bun for creating beautiful command-line applications with interactive prompts. It provides a set of tools to help you build feature-rich, interactive command-line interfaces with minimal effort.

## Key Features

- **CLI Framework**: Build robust command-line applications with an elegant API
- **Beautiful Prompts**: Create engaging user experiences through interactive CLI prompts
- **TypeScript-First**: Fully typed APIs for improved developer experience
- **Bun-Powered**: Lightning fast execution backed by Bun's runtime
- **Documentation-Ready**: Integrate with VitePress for beautiful documentation
- **Testing Built-In**: Unit testing powered by Bun's test runner

## Quick Start

Getting started with clapp is easy:

```bash
# Use this GitHub template or run the following command:
bunx degit stacksjs/clapp my-cli-app
cd my-cli-app

# Install dependencies
bun install

# Build the library
bun run build

# After you commit changes, you can create a release
bun run release # automates versioning and changelog generation
```

## Interactive Prompts Example

Create beautiful, interactive command-line experiences with our pre-styled prompt components:

```ts
import { confirm, intro, multiselect, outro, select, spinner, text } from '@stacksjs/clapp'

// Start an interactive session
intro('Project Setup Wizard')

// Simple text input
const name = await text({
  message: 'What is your project name?',
  placeholder: 'my-awesome-project',
  validate(value) {
    if (value.length === 0)
      return 'Name is required!'
  },
})

// Yes/no confirmation
const useTypeScript = await confirm({
  message: 'Do you want to use TypeScript?'
})

// Single selection from a list
const framework = await select({
  message: 'Select a framework:',
  options: [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue', hint: 'recommended' },
    { value: 'svelte', label: 'Svelte' },
  ],
})

// Multiple selections
const features = await multiselect({
  message: 'Select additional features:',
  options: [
    { value: 'router', label: 'Router' },
    { value: 'state', label: 'State Management' },
    { value: 'testing', label: 'Testing' },
  ],
  required: false,
})

// Show a spinner for long-running tasks
const s = spinner()
s.start('Installing dependencies')

// Simulate installation
await new Promise(resolve => setTimeout(resolve, 2000))

s.stop('Installation complete!')

// End the session
outro('You\'re all set! Happy coding!')
```

## CLI Framework Example

Build powerful command-line applications with a simple and elegant API:

```ts
import { CLI } from '@stacksjs/clapp'

const cli = new CLI('todo-app')
  .version('1.0.0')
  .help()

cli
  .command('add <task>', 'Add a new task')
  .option('-p, --priority <level>', 'Priority level (high, medium, low)')
  .action((task, options) => {
    console.log(`Adding task: ${task} with priority: ${options.priority || 'medium'}`)
  })

cli
  .command('list', 'List all tasks')
  .option('-a, --all', 'Show all tasks including completed ones')
  .action((options) => {
    console.log(`Listing ${options.all ? 'all' : 'pending'} tasks`)
  })

cli.parse()
```

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/clapp/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://stacksjs.com/discord)

## License

The MIT License (MIT). Please see [LICENSE](https://github.com/stacksjs/clapp/tree/main/LICENSE.md) for more information.

Made with 💙

<!-- Badges -->

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/rpx/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/rpx -->
