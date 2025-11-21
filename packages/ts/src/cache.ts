/**
 * Simple in-memory cache for CLI metadata and help text
 */

interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
}

class CLICache {
  private cache: Map<string, CacheEntry<any>>
  private enabled: boolean

  constructor() {
    this.cache = new Map()
    this.enabled = true
  }

  /**
   * Check if caching is enabled globally
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | undefined {
    if (!this.enabled) {
      return undefined
    }

    const entry = this.cache.get(key)

    if (!entry) {
      return undefined
    }

    // Check if expired
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return undefined
    }

    return entry.value as T
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl: number = 5000): void {
    if (!this.enabled) {
      return
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    })
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    if (!this.enabled) {
      return false
    }

    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    // Check if expired
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Clear specific key from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Disable cache
   */
  disable(): void {
    this.enabled = false
    this.clear()
  }

  /**
   * Enable cache
   */
  enable(): void {
    this.enabled = true
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number, enabled: boolean } {
    return {
      size: this.cache.size,
      enabled: this.enabled,
    }
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    const now = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const cliCache: CLICache = new CLICache()

// Auto cleanup every 30 seconds
setInterval(() => {
  cliCache.cleanup()
}, 30000)
