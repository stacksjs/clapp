---
title: Interactive Prompts
description: Create beautiful, interactive command-line experiences with clapp's prompt components.
---

# Interactive Prompts

clapp provides pre-styled prompt components for creating engaging, interactive CLI experiences.

## Available Prompts

- **text** - Single line text input
- **confirm** - Yes/no confirmation
- **select** - Single selection from options
- **multiselect** - Multiple selections from options
- **spinner** - Loading indicator for async operations
- **password** - Masked input for sensitive data

## Getting Started

Import the prompts you need:

```ts
import {
  confirm,
  intro,
  multiselect,
  outro,
  password,
  select,
  spinner,
  text,
} from '@stacksjs/clapp'
```

## Session Management

Use `intro` and `outro` to wrap your prompts:

```ts
intro('Welcome to the Setup Wizard')

// ... your prompts here ...

outro('Setup complete!')
```

## Text Input

Collect text input from users:

```ts
const name = await text({
  message: 'What is your name?',
  placeholder: 'John Doe',
  defaultValue: 'Anonymous',
  validate(value) {
    if (value.length === 0) return 'Name is required!'
    if (value.length < 2) return 'Name must be at least 2 characters'
  },
})

console.log(`Hello, ${name}!`)
```

### Text Options

| Option | Type | Description |
|--------|------|-------------|
| `message` | `string` | The prompt message |
| `placeholder` | `string` | Placeholder text (dimmed) |
| `defaultValue` | `string` | Default value if empty |
| `validate` | `(value) => string \| void` | Validation function |

## Password Input

Collect sensitive data with masked input:

```ts
const secret = await password({
  message: 'Enter your API key:',
  validate(value) {
    if (value.length < 10) return 'API key must be at least 10 characters'
  },
})
```

### Password Options

| Option | Type | Description |
|--------|------|-------------|
| `message` | `string` | The prompt message |
| `mask` | `string` | Character to use for masking (default: `*`) |
| `validate` | `(value) => string \| void` | Validation function |

## Confirm

Get yes/no confirmation:

```ts
const shouldContinue = await confirm({
  message: 'Do you want to continue?',
  initialValue: true,
})

if (shouldContinue) {
  console.log('Continuing...')
} else {
  console.log('Cancelled')
}
```

### Confirm Options

| Option | Type | Description |
|--------|------|-------------|
| `message` | `string` | The prompt message |
| `initialValue` | `boolean` | Initial selection (default: `false`) |
| `active` | `string` | Text for "yes" (default: `Yes`) |
| `inactive` | `string` | Text for "no" (default: `No`) |

## Select

Single selection from a list:

```ts
const framework = await select({
  message: 'Select a framework:',
  options: [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue', hint: 'recommended' },
    { value: 'svelte', label: 'Svelte' },
    { value: 'solid', label: 'Solid' },
  ],
  initialValue: 'vue',
})

console.log(`You selected: ${framework}`)
```

### Select Options

| Option | Type | Description |
|--------|------|-------------|
| `message` | `string` | The prompt message |
| `options` | `Option[]` | Array of options |
| `initialValue` | `string` | Initial selected value |
| `maxItems` | `number` | Max visible items before scrolling |

### Option Properties

| Property | Type | Description |
|----------|------|-------------|
| `value` | `string` | The value returned when selected |
| `label` | `string` | Display text |
| `hint` | `string` | Additional hint text (dimmed) |

## Multiselect

Multiple selections from a list:

```ts
const features = await multiselect({
  message: 'Select features:',
  options: [
    { value: 'typescript', label: 'TypeScript', hint: 'recommended' },
    { value: 'eslint', label: 'ESLint' },
    { value: 'prettier', label: 'Prettier' },
    { value: 'testing', label: 'Testing' },
  ],
  required: true,
  initialValues: ['typescript'],
})

console.log('Selected features:', features)
```

### Multiselect Options

| Option | Type | Description |
|--------|------|-------------|
| `message` | `string` | The prompt message |
| `options` | `Option[]` | Array of options |
| `required` | `boolean` | Require at least one selection |
| `initialValues` | `string[]` | Initially selected values |
| `maxItems` | `number` | Max visible items before scrolling |

## Spinner

Show loading state for async operations:

```ts
const s = spinner()

s.start('Installing dependencies')

// Simulate async operation
await installDependencies()

s.stop('Dependencies installed!')
```

### Spinner Methods

| Method | Description |
|--------|-------------|
| `start(message)` | Start the spinner with a message |
| `stop(message?)` | Stop the spinner with optional success message |
| `message(text)` | Update the spinner message |

### Advanced Spinner Usage

```ts
const s = spinner()

s.start('Building project')

try {
  await build()
  s.stop('Build successful!')
} catch (error) {
  s.stop('Build failed!')
  throw error
}
```

## Complete Example

Here's a full project setup wizard:

```ts
import {
  confirm,
  intro,
  multiselect,
  outro,
  select,
  spinner,
  text,
} from '@stacksjs/clapp'

async function main() {
  intro('Project Setup Wizard')

  // Get project name
  const name = await text({
    message: 'What is your project name?',
    placeholder: 'my-awesome-project',
    validate(value) {
      if (value.length === 0) return 'Name is required!'
      if (!/^[a-z0-9-]+$/.test(value)) {
        return 'Name can only contain lowercase letters, numbers, and hyphens'
      }
    },
  })

  // Choose framework
  const framework = await select({
    message: 'Select a framework:',
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue', hint: 'recommended' },
      { value: 'svelte', label: 'Svelte' },
    ],
  })

  // Use TypeScript?
  const useTypeScript = await confirm({
    message: 'Do you want to use TypeScript?',
    initialValue: true,
  })

  // Select features
  const features = await multiselect({
    message: 'Select additional features:',
    options: [
      { value: 'router', label: 'Router' },
      { value: 'state', label: 'State Management' },
      { value: 'testing', label: 'Testing' },
      { value: 'linting', label: 'ESLint + Prettier' },
    ],
    required: false,
  })

  // Confirm installation
  const shouldInstall = await confirm({
    message: 'Install dependencies now?',
  })

  // Create project
  const s = spinner()

  s.start('Creating project')
  await createProject({ name, framework, useTypeScript, features })
  s.stop('Project created!')

  if (shouldInstall) {
    s.start('Installing dependencies')
    await installDependencies()
    s.stop('Dependencies installed!')
  }

  outro(`Your project "${name}" is ready!`)

  console.log('\nNext steps:')
  console.log(`  cd ${name}`)
  if (!shouldInstall) {
    console.log('  bun install')
  }
  console.log('  bun run dev')
}

main()
```

## Handling Cancellation

Users can cancel prompts with `Ctrl+C`. Handle this gracefully:

```ts
import { isCancel, cancel } from '@stacksjs/clapp'

const name = await text({
  message: 'What is your name?',
})

if (isCancel(name)) {
  cancel('Operation cancelled')
  process.exit(0)
}
```

## Styling

Prompts come pre-styled with sensible defaults. The appearance automatically adapts to terminal capabilities.

## Next Steps

- Learn about [Commands](./commands.md) for CLI structure
- Set up [Testing](./testing.md) for your CLI
