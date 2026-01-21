/**
 * Simple in-memory cache for CLI metadata and help text
 */

interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
}

interface CacheStats {
  size: number
  enabled: boolean
  hits: number
  misses: number
}

class CLICache {
  private cache: Map<string, CacheEntry<unknown>>
  private enabled: boolean
  private cleanupInterval: ReturnType<typeof setInterval> | null = null
  private hits = 0
  private misses = 0

  constructor() {
    this.cache = new Map()
    this.enabled = true
    this.startCleanupInterval()
  }

  /**
   * Start the automatic cleanup interval
   */
  private startCleanupInterval(): void {
    if (this.cleanupInterval) {
      return
    }
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 30000)
    // Allow the process to exit even if the interval is running
    this.cleanupInterval.unref()
  }

  /**
   * Stop the automatic cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
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
      this.misses++
      return undefined
    }

    const entry = this.cache.get(key)

    if (!entry) {
      this.misses++
      return undefined
    }

    // Check if expired
    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      this.misses++
      return undefined
    }

    this.hits++
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
  stats(): CacheStats {
    return {
      size: this.cache.size,
      enabled: this.enabled,
      hits: this.hits,
      misses: this.misses,
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.hits = 0
    this.misses = 0
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
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

  /**
   * Destroy the cache and stop cleanup interval
   */
  destroy(): void {
    this.stopCleanup()
    this.clear()
    this.resetStats()
  }
}

// Global cache instance
export const cliCache: CLICache = new CLICache()
