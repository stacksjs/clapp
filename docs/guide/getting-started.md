---
title: Getting Started
description: Learn how to install and set up clapp to build powerful CLI applications.
---

# Getting Started

clapp is an elegant, TypeScript-first CLI framework built on Bun for creating beautiful command-line applications with interactive prompts.

## Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher (recommended)
- Node.js v18+ (alternative)

## Installation

Install clapp as a dependency in your project:

```bash
# Using Bun (recommended)
bun add @stacksjs/clapp

# Using npm
npm install @stacksjs/clapp

# Using pnpm
pnpm add @stacksjs/clapp

# Using yarn
yarn add @stacksjs/clapp
```

## Quick Start

Create a simple CLI application:

```ts
// cli.ts
import { CLI } from '@stacksjs/clapp'

const cli = new CLI('my-app')
  .version('1.0.0')
  .help()

cli
  .command('hello <name>', 'Say hello to someone')
  .option('-l, --loud', 'Say it loudly')
  .action((name, options) => {
    const greeting = `Hello, ${name}!`
    console.log(options.loud ? greeting.toUpperCase() : greeting)
  })

// `run()` is preferred over `parse()` for executables — it catches
// usage errors (unknown flag, missing argument) and exits with a
// friendly one-line message + exit code 2 instead of a stack trace.
await cli.run()
```

Run your CLI:

```bash
# Using Bun
bun cli.ts hello World
# Output: Hello, World!

bun cli.ts hello World --loud
# Output: HELLO, WORLD!
```

## Project Template

Use the official template to scaffold a complete CLI project:

```bash
bunx degit stacksjs/clapp my-cli-app
cd my-cli-app
bun install
```

This gives you:

- Pre-configured TypeScript setup
- Build scripts for creating distributable binaries
- Example commands and prompts
- Testing setup with Bun's test runner
- GitHub Actions CI/CD configuration

## Basic Concepts

### CLI Instance

The `CLI` class is the foundation of your command-line application:

```ts
import { CLI } from '@stacksjs/clapp'

const cli = new CLI('my-app')
  .version('1.0.0')  // Set version (shown with --version)
  .help()            // Enable help (shown with --help)
```

### Commands

Commands are the actions your CLI can perform:

```ts
cli.command('build', 'Build the project')
   .action(() => {
     console.log('Building...')
   })

// With required arguments
cli.command('greet <name>', 'Greet someone')

// With optional arguments
cli.command('greet [name]', 'Greet someone (optionally)')
```

### Options

Options modify command behavior:

```ts
cli.command('serve', 'Start the server')
   .option('-p, --port <port>', 'Port to listen on', { default: 3000 })
   .option('-h, --host <host>', 'Host to bind to', { default: 'localhost' })
   .action((options) => {
     console.log(`Server running at http://${options.host}:${options.port}`)
   })
```

### Parsing

For a shipped binary, `await cli.run()` is the recommended entry point — it's `parse()` wrapped with usage-error handling:

```ts
await cli.run()         // Uses process.argv. Catches usage errors, exits 2.
await cli.run(args)     // Custom arguments array.
```

Under the hood:

```ts
// `run()` is shorthand for:
await cli.parse(process.argv, { exitOnError: true })
```

Use `cli.parse()` directly when you want to handle usage errors yourself (tests, programmatic consumers) — it rethrows the underlying `ClappError` unchanged.

## Next Steps

- Learn about [Commands](./commands.md) in depth
- Explore [Interactive Prompts](./prompts.md)
- Set up [Testing](./testing.md) for your CLI

## Ecosystem Integration

clapp is used throughout the Stacks ecosystem:

- **[Stacks Framework](https://stacksjs.org)** - Uses clapp for the `buddy` CLI
- **[BunPress](https://bunpress.sh)** - Documentation site generator CLI
- **[dtsx](https://dtsx.stacksjs.org)** - TypeScript declaration file generator CLI
- **[bumpx](https://bumpx.stacksjs.org)** - Version bumping CLI
