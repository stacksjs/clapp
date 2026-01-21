---
title: Async Prompts
description: Learn how to handle asynchronous operations in clapp prompts.
---

# Async Prompts

Clapp prompts are fully asynchronous, allowing you to integrate with APIs, databases, and other async operations.

## Basic Async Usage

All prompts return promises and should be awaited:

```ts
import { text, select, confirm } from '@stacksjs/clapp'

async function main() {
  const name = await text({ message: 'Your name:' })
  const choice = await select({
    message: 'Pick one:',
    options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ],
  })

  console.log(`${name} chose ${choice}`)
}

main()
```

## Async Validation

Validation functions can perform async operations:

```ts
import { text } from '@stacksjs/clapp'

const username = await text({
  message: 'Choose a username:',
  async validate(value) {
    // Check username availability via API
    const response = await fetch(`/api/check-username/${value}`)
    const { available } = await response.json()

    if (!available) {
      return 'This username is already taken'
    }
  },
})
```

### With Loading State

```ts
const email = await text({
  message: 'Enter your email:',
  async validate(value) {
    // Show that validation is happening
    const response = await fetch('/api/validate-email', {
      method: 'POST',
      body: JSON.stringify({ email: value }),
    })

    const result = await response.json()

    if (!result.valid) {
      return result.error
    }
  },
})
```

## Dynamic Options

Load select options asynchronously:

```ts
import { select } from '@stacksjs/clapp'

// Fetch options before prompting
const response = await fetch('/api/frameworks')
const frameworks = await response.json()

const framework = await select({
  message: 'Select a framework:',
  options: frameworks.map(f => ({
    value: f.id,
    label: f.name,
    hint: f.description,
  })),
})
```

### With Loading Indicator

```ts
import { spinner, select } from '@stacksjs/clapp'

const s = spinner()
s.start('Loading options...')

const response = await fetch('/api/templates')
const templates = await response.json()

s.stop('Options loaded!')

const template = await select({
  message: 'Choose a template:',
  options: templates,
})
```

## Sequential Prompts with Async Operations

Chain prompts with async work between them:

```ts
import { text, confirm, spinner } from '@stacksjs/clapp'

async function setupProject() {
  // Get project name
  const name = await text({ message: 'Project name:' })

  // Check if directory exists
  const s = spinner()
  s.start('Checking directory...')

  const exists = await checkDirectoryExists(name)

  if (exists) {
    s.stop('Directory already exists')

    const overwrite = await confirm({
      message: 'Directory exists. Overwrite?',
    })

    if (!overwrite) {
      return
    }
  } else {
    s.stop('Directory is available')
  }

  // Continue with setup
  s.start('Creating project...')
  await createProject(name)
  s.stop('Project created!')
}
```

## Parallel Operations

Run multiple async operations in parallel:

```ts
import { intro, outro, spinner } from '@stacksjs/clapp'

async function setup() {
  intro('Setup')

  const s = spinner()
  s.start('Preparing environment...')

  // Run checks in parallel
  const [nodeVersion, gitInstalled, diskSpace] = await Promise.all([
    checkNodeVersion(),
    checkGitInstalled(),
    checkDiskSpace(),
  ])

  s.stop('Environment checked!')

  // Report results
  console.log(`Node: ${nodeVersion}`)
  console.log(`Git: ${gitInstalled ? 'installed' : 'missing'}`)
  console.log(`Disk: ${diskSpace}GB available`)

  outro('Ready!')
}
```

## Error Handling

Handle async errors gracefully:

```ts
import { text, cancel, isCancel } from '@stacksjs/clapp'

async function fetchConfig() {
  const url = await text({
    message: 'Config URL:',
    async validate(value) {
      try {
        const response = await fetch(value)
        if (!response.ok) {
          return `Failed to fetch: ${response.status}`
        }
        const data = await response.json()
        if (!data.version) {
          return 'Invalid config format'
        }
      } catch (error) {
        return `Network error: ${error.message}`
      }
    },
  })

  if (isCancel(url)) {
    cancel('Cancelled')
    return
  }

  // Proceed with valid URL
  const response = await fetch(url)
  return response.json()
}
```

## Retry Logic

Implement retry for flaky operations:

```ts
import { text, confirm } from '@stacksjs/clapp'

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      const retry = await confirm({
        message: `Failed: ${error.message}. Retry?`,
      })
      if (!retry) {
        throw error
      }
    }
  }

  throw lastError
}

// Usage
const data = await withRetry(async () => {
  const response = await fetch('/api/data')
  if (!response.ok) throw new Error('API error')
  return response.json()
})
```

## Progress Updates

Update spinner message during long operations:

```ts
import { spinner } from '@stacksjs/clapp'

async function downloadFiles(files: string[]) {
  const s = spinner()

  for (let i = 0; i < files.length; i++) {
    s.start(`Downloading ${files[i]} (${i + 1}/${files.length})...`)
    await downloadFile(files[i])
  }

  s.stop('All files downloaded!')
}
```

## Conditional Prompts

Show prompts based on async conditions:

```ts
import { select, confirm } from '@stacksjs/clapp'

async function conditionalSetup() {
  // Check existing configuration
  const hasConfig = await checkExistingConfig()

  if (hasConfig) {
    const useExisting = await confirm({
      message: 'Found existing config. Use it?',
    })

    if (useExisting) {
      return loadExistingConfig()
    }
  }

  // Otherwise, prompt for new config
  const database = await select({
    message: 'Choose database:',
    options: [
      { value: 'sqlite', label: 'SQLite' },
      { value: 'postgres', label: 'PostgreSQL' },
      { value: 'mysql', label: 'MySQL' },
    ],
  })

  return { database }
}
```

## Cancellation Handling

Handle user cancellation in async workflows:

```ts
import { text, isCancel, cancel } from '@stacksjs/clapp'

async function safePrompt() {
  const name = await text({ message: 'Name:' })

  if (isCancel(name)) {
    // Cleanup any pending operations
    await cleanup()

    cancel('Cancelled')
    process.exit(0)
  }

  return name
}
```

## Best Practices

### 1. Show Progress

Always show loading states for long operations:

```ts
const s = spinner()
s.start('Processing...')
await longOperation()
s.stop('Done!')
```

### 2. Handle Errors

Catch and handle errors with helpful messages:

```ts
try {
  await operation()
} catch (error) {
  console.error(`Error: ${error.message}`)
  // Offer recovery options
}
```

### 3. Allow Cancellation

Check for cancellation at appropriate points:

```ts
if (isCancel(result)) {
  cancel('Operation cancelled')
  return
}
```

### 4. Validate Early

Validate input before expensive operations:

```ts
const url = await text({
  message: 'URL:',
  validate(value) {
    try {
      new URL(value)
    } catch {
      return 'Invalid URL'
    }
  },
})

// URL is valid, safe to fetch
const data = await fetch(url)
```

## Next Steps

- Explore [Styling](/prompts/styling) options
- Learn about the [CLI Framework](/api/cli-framework)
