# Validation

clapp provides powerful validation capabilities for all prompt types, ensuring users provide valid input before proceeding.

## Basic Validation

All input prompts accept a `validate` function that returns an error message if validation fails:

```typescript
import { text } from '@stacksjs/clapp'

const email = await text({
  message: 'Enter your email:',
  validate(value) {
    if (!value.includes('@')) {
      return 'Please enter a valid email address'
    }
  },
})
```

If validation passes, return `undefined` or nothing.

## Common Patterns

### Required Fields

```typescript
const name = await text({
  message: 'What is your name?',
  validate(value) {
    if (value.length === 0) {
      return 'Name is required'
    }
  },
})
```

### Length Validation

```typescript
const username = await text({
  message: 'Choose a username:',
  validate(value) {
    if (value.length < 3) {
      return 'Username must be at least 3 characters'
    }
    if (value.length > 20) {
      return 'Username must be at most 20 characters'
    }
  },
})
```

### Pattern Matching

```typescript
const projectName = await text({
  message: 'Project name:',
  validate(value) {
    if (!/^[a-z0-9-]+$/.test(value)) {
      return 'Name can only contain lowercase letters, numbers, and hyphens'
    }
    if (value.startsWith('-') || value.endsWith('-')) {
      return 'Name cannot start or end with a hyphen'
    }
  },
})
```

### Multiple Conditions

```typescript
const password = await password({
  message: 'Create a password:',
  validate(value) {
    const errors = []

    if (value.length < 8) {
      errors.push('at least 8 characters')
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('one uppercase letter')
    }
    if (!/[a-z]/.test(value)) {
      errors.push('one lowercase letter')
    }
    if (!/[0-9]/.test(value)) {
      errors.push('one number')
    }

    if (errors.length > 0) {
      return `Password must contain: ${errors.join(', ')}`
    }
  },
})
```

## Async Validation

Validation functions can be asynchronous for remote checks:

```typescript
const username = await text({
  message: 'Choose a username:',
  async validate(value) {
    const response = await fetch(`/api/check-username?name=${value}`)
    const { available } = await response.json()

    if (!available) {
      return 'This username is already taken'
    }
  },
})
```

### With Error Handling

```typescript
const email = await text({
  message: 'Enter your email:',
  async validate(value) {
    try {
      const response = await fetch('/api/validate-email', {
        method: 'POST',
        body: JSON.stringify({ email: value }),
      })

      if (!response.ok) {
        return 'Could not validate email. Please try again.'
      }

      const { valid, reason } = await response.json()
      if (!valid) {
        return reason
      }
    }
    catch (error) {
      return 'Network error. Please check your connection.'
    }
  },
})
```

## Reusable Validators

Create reusable validators with context:

```typescript
function createValidator(existingNames: string[]) {
  return function validate(value: string) {
    if (existingNames.includes(value)) {
      return 'This name already exists'
    }
  }
}

const existingProjects = ['my-app', 'my-api', 'my-site']

const name = await text({
  message: 'Project name:',
  validate: createValidator(existingProjects),
})
```

## Multiselect Validation

For multiselect, validate the array of selected values:

```typescript
const features = await multiselect({
  message: 'Select features:',
  options: [
    { value: 'auth', label: 'Authentication' },
    { value: 'api', label: 'API' },
    { value: 'db', label: 'Database' },
    { value: 'cache', label: 'Caching' },
  ],
  validate(values) {
    if (values.length === 0) {
      return 'Please select at least one feature'
    }
    if (values.length > 3) {
      return 'Please select at most 3 features'
    }
  },
})
```

## Common Validators

### Email Validator

```typescript
function validateEmail(value: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address'
  }
}
```

### URL Validator

```typescript
function validateUrl(value: string) {
  try {
    new URL(value)
  }
  catch {
    return 'Please enter a valid URL'
  }
}
```

### Number Validator

```typescript
function validateNumber(min: number, max: number) {
  return function (value: string) {
    const num = Number(value)
    if (Number.isNaN(num)) {
      return 'Please enter a valid number'
    }
    if (num < min || num > max) {
      return `Please enter a number between ${min} and ${max}`
    }
  }
}
```

### Semver Validator

```typescript
function validateSemver(value: string) {
  if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(value)) {
    return 'Version must follow semver format (e.g., 1.0.0, 2.1.3-beta.1)'
  }
}
```

## User Experience Tips

### Clear Error Messages

```typescript
// Good - tells user what to do
validate(value) {
  if (value.length < 3) {
    return 'Username must be at least 3 characters long'
  }
}

// Less helpful - doesn't explain requirement
validate(value) {
  if (value.length < 3) {
    return 'Invalid username'
  }
}
```

### Progressive Validation

Check the most basic requirements first:

```typescript
validate(value) {
  // Check required first
  if (!value) {
    return 'Email is required'
  }

  // Then format
  if (!value.includes('@')) {
    return 'Please enter a valid email format'
  }

  // Then domain restrictions
  if (!value.endsWith('.com') && !value.endsWith('.org')) {
    return 'Only .com and .org emails are accepted'
  }
}
```

### Providing Examples

```typescript
const version = await text({
  message: 'Version (e.g., 1.0.0):',
  placeholder: '1.0.0',
  validate(value) {
    if (!/^\d+\.\d+\.\d+$/.test(value)) {
      return 'Version must follow semver format (e.g., 1.0.0, 2.1.3)'
    }
  },
})
```

## Next Steps

- Learn about [Prompts](/guide/prompts) for all prompt types
- See [Testing](/guide/testing) for testing your CLI
