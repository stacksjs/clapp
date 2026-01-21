# Cache API Reference

The `cliCache` module provides a simple in-memory cache for CLI metadata and help text. It automatically handles TTL (time-to-live) expiration and cleanup.

## Importing

```ts
import { cliCache } from '@stacksjs/clapp'
```

## Methods

### get(key)

Retrieves a value from the cache.

```ts
const value = cliCache.get<string>('my-key')

if (value !== undefined) {
  console.log('Cache hit:', value)
} else {
  console.log('Cache miss')
}
```

#### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | `string` | The cache key |

#### Returns

Returns the cached value or `undefined` if not found or expired.

### set(key, value, ttl?)

Stores a value in the cache.

```ts
// Cache for default 5 seconds
cliCache.set('my-key', 'my-value')

// Cache for 30 seconds
cliCache.set('my-key', 'my-value', 30000)

// Cache objects
cliCache.set('config', { debug: true, verbose: false }, 60000)
```

#### Parameters

| Parameter | Type | Description | Default |
| --------- | ---- | ----------- | ------- |
| `key` | `string` | The cache key | Required |
| `value` | `T` | The value to cache | Required |
| `ttl` | `number` | Time-to-live in milliseconds | `5000` |

### has(key)

Checks if a key exists in the cache (and hasn't expired).

```ts
if (cliCache.has('my-key')) {
  console.log('Key exists')
}
```

#### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | `string` | The cache key |

#### Returns

Returns `true` if the key exists and hasn't expired, `false` otherwise.

### delete(key)

Removes a specific key from the cache.

```ts
cliCache.delete('my-key')
```

#### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `key` | `string` | The cache key |

### clear()

Removes all entries from the cache.

```ts
cliCache.clear()
```

### keys()

Returns all cache keys.

```ts
const allKeys = cliCache.keys()
console.log('Cached keys:', allKeys)
```

#### Returns

Returns an array of cache key strings.

### enable()

Enables the cache (if previously disabled).

```ts
cliCache.enable()
```

### disable()

Disables the cache and clears all entries.

```ts
cliCache.disable()
```

### isEnabled()

Checks if the cache is enabled.

```ts
if (cliCache.isEnabled()) {
  console.log('Cache is enabled')
}
```

#### Returns

Returns `true` if caching is enabled.

### stats()

Returns cache statistics.

```ts
const stats = cliCache.stats()
console.log('Cache stats:', stats)
// { size: 5, enabled: true, hits: 10, misses: 3 }
```

#### Returns

Returns an object with:

| Property | Type | Description |
| -------- | ---- | ----------- |
| `size` | `number` | Number of entries in cache |
| `enabled` | `boolean` | Whether cache is enabled |
| `hits` | `number` | Number of cache hits |
| `misses` | `number` | Number of cache misses |

### resetStats()

Resets the hit/miss statistics.

```ts
cliCache.resetStats()
```

### cleanup()

Manually triggers cleanup of expired entries.

```ts
cliCache.cleanup()
```

Note: Cleanup runs automatically every 30 seconds.

### stopCleanup()

Stops the automatic cleanup interval.

```ts
cliCache.stopCleanup()
```

### destroy()

Destroys the cache, stopping cleanup and clearing all entries and stats.

```ts
cliCache.destroy()
```

## Usage Examples

### Basic Caching

```ts
import { cliCache } from '@stacksjs/clapp'

// Cache expensive computation
function getExpensiveData() {
  const cached = cliCache.get<string[]>('expensive-data')
  if (cached) {
    return cached
  }

  const data = computeExpensiveData()
  cliCache.set('expensive-data', data, 60000) // Cache for 1 minute
  return data
}
```

### Caching CLI Help Text

```ts
import { cli, cliCache } from '@stacksjs/clapp'

function getHelpText(commandName: string): string {
  const cacheKey = `help:${commandName}`
  const cached = cliCache.get<string>(cacheKey)

  if (cached) {
    return cached
  }

  const helpText = generateHelpText(commandName)
  cliCache.set(cacheKey, helpText, 300000) // Cache for 5 minutes
  return helpText
}
```

### Monitoring Cache Performance

```ts
import { cliCache } from '@stacksjs/clapp'

// After some operations
const stats = cliCache.stats()
const hitRate = stats.hits / (stats.hits + stats.misses) * 100
console.log(`Cache hit rate: ${hitRate.toFixed(1)}%`)
```

### Disabling Cache for Testing

```ts
import { cliCache } from '@stacksjs/clapp'

beforeEach(() => {
  cliCache.disable()
})

afterEach(() => {
  cliCache.enable()
})
```

## Configuration

The cache can be disabled globally using the `--no-cache` CLI flag when you've enabled it with `cli.cache()`:

```ts
const app = cli('mycli')
  .cache() // Adds --no-cache flag

app.command('build')
  .action(() => {
    if (app.isNoCache) {
      cliCache.disable()
    }
    // ... build logic
  })
```

## Notes

- The cache is in-memory only and does not persist between process restarts
- The cleanup interval uses `.unref()` so it won't keep the process running
- Cache is shared globally within the application
- TTL is checked on access, expired entries are removed automatically
