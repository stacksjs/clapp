# Telemetry API Reference

The `telemetry` module provides a privacy-focused telemetry system for tracking CLI usage. It is opt-in only and respects user privacy preferences.

## Privacy Principles

- **Opt-in only**: Telemetry is disabled by default
- **Respects DO_NOT_TRACK**: Honors the `DO_NOT_TRACK` environment variable
- **No personal information**: Only collects anonymous usage data
- **User control**: Can be disabled at any time
- **Silent failures**: Never breaks the CLI if telemetry fails

## Importing

```ts
import { telemetry } from '@stacksjs/clapp'
```

## Methods

### isEnabled()

Checks if telemetry is currently enabled.

```ts
const enabled = await telemetry.isEnabled()
console.log('Telemetry enabled:', enabled)
```

#### Returns

Returns a Promise resolving to `true` if telemetry is enabled and not blocked by environment variables.

### enable()

Enables telemetry and generates an anonymous user ID.

```ts
await telemetry.enable()
console.log('Telemetry enabled')
```

### disable()

Disables telemetry.

```ts
await telemetry.disable()
console.log('Telemetry disabled')
```

### track(event, data?)

Tracks a custom event.

```ts
await telemetry.track('feature_used', {
  feature: 'dark-mode',
  command: 'config',
})
```

#### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `event` | `string` | Event name |
| `data` | `Record<string, unknown>` | Optional event data |

### trackCommand(command, duration?)

Tracks command execution.

```ts
const startTime = Date.now()

// ... command execution

await telemetry.trackCommand('build', Date.now() - startTime)
```

#### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `command` | `string` | Command name |
| `duration` | `number` | Optional execution duration in ms |

### trackError(error, command?)

Tracks an error occurrence.

```ts
try {
  await riskyOperation()
} catch (error) {
  await telemetry.trackError(error.message, 'deploy')
}
```

#### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `error` | `string` | Error message |
| `command` | `string` | Optional command where error occurred |

### send()

Sends collected telemetry data to the analytics service.

```ts
const success = await telemetry.send()
if (success) {
  console.log('Telemetry sent successfully')
}
```

#### Returns

Returns a Promise resolving to `true` if successful, `false` otherwise.

Note: Events are automatically sent when 10+ events are queued.

### flush()

Forces immediate sending of all pending events.

```ts
// Useful before process exit
await telemetry.flush()
```

#### Returns

Returns a Promise resolving to `true` if successful.

### status()

Gets the current telemetry status.

```ts
const status = await telemetry.status()
console.log(status)
// {
//   enabled: true,
//   doNotTrack: false,
//   eventsQueued: 3,
//   lastSent: 1704067200000
// }
```

#### Returns

Returns a Promise resolving to:

| Property | Type | Description |
| -------- | ---- | ----------- |
| `enabled` | `boolean` | Whether telemetry is enabled |
| `doNotTrack` | `boolean` | Whether DO_NOT_TRACK is set |
| `eventsQueued` | `number` | Number of events waiting to be sent |
| `lastSent` | `number \| undefined` | Timestamp of last successful send |

## Event Data

Each event automatically includes:

| Field | Description |
| ----- | ----------- |
| `event` | The event name |
| `timestamp` | Unix timestamp in milliseconds |
| `platform` | Operating system (darwin, linux, win32) |
| `nodeVersion` | Node.js/Bun version |

## Environment Variables

Telemetry respects these environment variables:

| Variable | Description |
| -------- | ----------- |
| `DO_NOT_TRACK=1` | Disables telemetry (standard) |
| `NO_TELEMETRY=1` | Disables telemetry (alternative) |

## Configuration Storage

Telemetry configuration is stored in:

```
~/.config/clapp/telemetry.json
```

## Usage Examples

### Basic Telemetry Setup

```ts
import { cli, telemetry } from '@stacksjs/clapp'

const app = cli('mycli')
  .version('1.0.0')

app.command('build')
  .action(async () => {
    const startTime = Date.now()

    try {
      await buildProject()
      await telemetry.trackCommand('build', Date.now() - startTime)
    } catch (error) {
      await telemetry.trackError(error.message, 'build')
      throw error
    }
  })

// Ensure events are sent before exit
process.on('beforeExit', async () => {
  await telemetry.flush()
})

await app.parse()
```

### Opt-in Telemetry Command

```ts
app.command('telemetry', 'Manage telemetry settings')
  .option('--enable', 'Enable telemetry')
  .option('--disable', 'Disable telemetry')
  .option('--status', 'Show telemetry status')
  .action(async (options) => {
    if (options.enable) {
      await telemetry.enable()
      console.log('Telemetry enabled. Thank you for helping improve this tool!')
    } else if (options.disable) {
      await telemetry.disable()
      console.log('Telemetry disabled.')
    } else if (options.status) {
      const status = await telemetry.status()
      console.log('Telemetry status:')
      console.log(`  Enabled: ${status.enabled}`)
      console.log(`  DO_NOT_TRACK: ${status.doNotTrack}`)
      console.log(`  Events queued: ${status.eventsQueued}`)
      if (status.lastSent) {
        console.log(`  Last sent: ${new Date(status.lastSent).toISOString()}`)
      }
    } else {
      // Show current status by default
      const enabled = await telemetry.isEnabled()
      console.log(`Telemetry is ${enabled ? 'enabled' : 'disabled'}`)
    }
  })
```

### Feature Usage Tracking

```ts
app.command('config')
  .option('--theme <theme>', 'Set color theme')
  .action(async (options) => {
    if (options.theme) {
      await setTheme(options.theme)
      await telemetry.track('config_changed', {
        setting: 'theme',
        value: options.theme,
      })
    }
  })
```

## Retry Behavior

The telemetry system includes automatic retry with exponential backoff:

- Max retries: 3
- Initial delay: 1 second
- Delay doubles with each retry (1s, 2s, 4s)
- Events are cleared after max retries to prevent memory buildup

## Best Practices

1. **Always ask for consent**: Add a first-run prompt or command to enable telemetry
2. **Be transparent**: Document what data you collect
3. **Flush before exit**: Call `telemetry.flush()` before process exit
4. **Handle gracefully**: Telemetry failures are silent and never affect CLI functionality
5. **Respect user choice**: Check `isEnabled()` before intensive tracking operations
