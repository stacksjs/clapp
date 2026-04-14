<p align="center"><img src=".github/art/cover.jpg" alt="Social Card of this repo"></p>

[![npm version][npm-version-src]][npm-version-href]
[![GitHub Actions][github-actions-src]][github-actions-href]
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
<!-- [![npm downloads][npm-downloads-src]][npm-downloads-href] -->
<!-- [![Codecov][codecov-src]][codecov-href] -->

# clapp

An elegant, TypeScript-first CLI framework built on Bun for creating beautiful command-line applications with interactive prompts.

## Features

This toolkit comes packed with everything you need to build professional command-line applications:

- 🛠️ **Powerful CLI Framework** - Build robust command-line applications with an elegant API
- 💎 **Beautiful Prompts** - Create engaging user experiences through interactive CLI prompts
- 🧠 **TypeScript-First** - Fully typed APIs for improved developer experience
- ⚡ **Bun-Powered** - Lightning fast execution backed by Bun's runtime
- 📚 **Documentation-Ready** - Integrate with VitePress for beautiful documentation
- 🧪 **Testing Built-In** - Unit testing powered by Bun's test runner
- 🐙 **CI/CD Ready** - GitHub Actions, Renovate, and more

## Interactive Prompts

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

### Prompt Components

- **text**: Single line text input
- **confirm**: Yes/no confirmation
- **select**: Single selection from a list of options
- **multiselect**: Multiple selections from a list of options
- **spinner**: Show a loading indicator for async operations
- **password**: Masked input for sensitive information

## CLI Framework

Build powerful command-line applications with a simple and elegant API inspired by CAC:

```js
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

## Get Started

Getting started with clapp is simple:

```bash
# Use this GitHub template or run the following command
bunx degit stacksjs/clapp my-cli-app
cd my-cli-app

# Install dependencies
bun install

# Build the library
bun run build

# After you commit changes, you can create a release
bun run release # automates versioning and changelog generation
```

## Testing

Run the test suite with:

```bash
bun test
```

## Changelog

Please see our [releases](https://github.com/stackjs/clapp/releases) page for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:

[Discussions on GitHub](https://github.com/stacksjs/clapp/discussions)

For casual chit-chat with others using this package:

[Join the Stacks Discord Server](https://discord.gg/stacksjs)

## Postcardware

"Software that is free, but hopes for a postcard." We love receiving postcards from around the world showing where Stacks is being used! We showcase them on our website too.

Our address: Stacks.js, 12665 Village Ln #2306, Playa Vista, CA 90094, United States 🌎

## Credits

- [CAC](https://github.com/cacjs/cac) - The original inspiration for this CLI Framework
- [clack](https://github.com/bombshell-dev/clack) - The inspiration for the interactive prompt system

## Sponsors

We would like to extend our thanks to the following sponsors for funding Stacks development. If you are interested in becoming a sponsor, please reach out to us.

- [JetBrains](https://www.jetbrains.com/)
- [The Solana Foundation](https://solana.com/)

## License

The MIT License (MIT). Please see [LICENSE](LICENSE.md) for more information.

Made with 💙

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@stacksjs/clapp?style=flat-square
[npm-version-href]: https://npmjs.com/package/@stacksjs/clapp
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/stacksjs/clapp/ci.yml?style=flat-square&branch=main
[github-actions-href]: https://github.com/stacksjs/clapp/actions?query=workflow%3Aci

<!-- [codecov-src]: https://img.shields.io/codecov/c/gh/stacksjs/clapp/main?style=flat-square
[codecov-href]: https://codecov.io/gh/stacksjs/clapp -->
