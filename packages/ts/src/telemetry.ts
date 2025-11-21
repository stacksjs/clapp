/**
 * Privacy-focused telemetry system
 *
 * - Opt-in only
 * - Respects DO_NOT_TRACK
 * - No personal information collected
 * - Can be disabled anytime
 */

import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

export interface TelemetryEvent {
  event: string
  command?: string
  timestamp: number
  platform: string
  nodeVersion: string
  cliVersion?: string
}

export interface TelemetryConfig {
  enabled: boolean
  userId?: string
  lastSent?: number
}

class Telemetry {
  private configPath: string
  private config: TelemetryConfig | null = null
  private events: TelemetryEvent[] = []

  constructor() {
    // Store config in user's home directory
    const homeDir = os.homedir()
    const configDir = path.join(homeDir, '.config', 'clapp')
    this.configPath = path.join(configDir, 'telemetry.json')
  }

  /**
   * Check if telemetry is enabled
   */
  async isEnabled(): Promise<boolean> {
    // Check DO_NOT_TRACK environment variable
    if (process.env.DO_NOT_TRACK === '1' || process.env.DO_NOT_TRACK === 'true') {
      return false
    }

    // Check NO_TELEMETRY environment variable
    if (process.env.NO_TELEMETRY === '1' || process.env.NO_TELEMETRY === 'true') {
      return false
    }

    const config = await this.loadConfig()
    return config.enabled
  }

  /**
   * Enable telemetry
   */
  async enable(): Promise<void> {
    const config = await this.loadConfig()
    config.enabled = true

    // Generate anonymous user ID if not exists
    if (!config.userId) {
      config.userId = this.generateUserId()
    }

    await this.saveConfig(config)
  }

  /**
   * Disable telemetry
   */
  async disable(): Promise<void> {
    const config = await this.loadConfig()
    config.enabled = false
    await this.saveConfig(config)
  }

  /**
   * Track an event
   */
  async track(event: string, data?: Record<string, any>): Promise<void> {
    const enabled = await this.isEnabled()

    if (!enabled) {
      return
    }

    const telemetryEvent: TelemetryEvent = {
      event,
      ...data,
      timestamp: Date.now(),
      platform: os.platform(),
      nodeVersion: process.version,
    }

    this.events.push(telemetryEvent)

    // Auto-send if we have 10+ events
    if (this.events.length >= 10) {
      await this.send()
    }
  }

  /**
   * Track command execution
   */
  async trackCommand(command: string, duration?: number): Promise<void> {
    await this.track('command', {
      command,
      duration,
    })
  }

  /**
   * Track error
   */
  async trackError(error: string, command?: string): Promise<void> {
    await this.track('error', {
      error,
      command,
    })
  }

  /**
   * Send collected telemetry data
   */
  async send(): Promise<void> {
    const enabled = await this.isEnabled()

    if (!enabled || this.events.length === 0) {
      return
    }

    try {
      // In a real implementation, you would send to your analytics service
      // For now, we just clear the events
      // await fetch('https://your-analytics-endpoint.com/events', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ events: this.events }),
      // })

      this.events = []

      // Update last sent timestamp
      const config = await this.loadConfig()
      config.lastSent = Date.now()
      await this.saveConfig(config)
    }
    catch (error) {
      // Silently fail - telemetry should never break the CLI
      console.error('Error sending telemetry:', error)
      this.events = []
    }
  }

  /**
   * Get telemetry status
   */
  async status(): Promise<{
    enabled: boolean
    doNotTrack: boolean
    eventsQueued: number
    lastSent?: number
  }> {
    const config = await this.loadConfig()

    return {
      enabled: config.enabled,
      doNotTrack: process.env.DO_NOT_TRACK === '1' || process.env.DO_NOT_TRACK === 'true',
      eventsQueued: this.events.length,
      lastSent: config.lastSent,
    }
  }

  /**
   * Load telemetry config
   */
  private async loadConfig(): Promise<TelemetryConfig> {
    if (this.config) {
      return this.config
    }

    try {
      if (existsSync(this.configPath)) {
        const data = await fs.readFile(this.configPath, 'utf-8')
        this.config = JSON.parse(data)
        return this.config!
      }
    }
    catch (error) {
      // Ignore errors
      console.error('Error loading telemetry config:', error)
    }

    // Default config (disabled by default)
    this.config = {
      enabled: false,
    }

    return this.config
  }

  /**
   * Save telemetry config
   */
  private async saveConfig(config: TelemetryConfig): Promise<void> {
    this.config = config

    try {
      const configDir = path.dirname(this.configPath)

      // Ensure directory exists
      await fs.mkdir(configDir, { recursive: true })

      // Write config
      await fs.writeFile(
        this.configPath,
        JSON.stringify(config, null, 2),
        'utf-8',
      )
    }
    catch (error) {
      // Ignore errors
      console.error('Error saving telemetry config:', error)
    }
  }

  /**
   * Generate anonymous user ID
   */
  private generateUserId(): string {
    const random = Math.random().toString(36).substring(2, 15)
    const timestamp = Date.now().toString(36)
    return `${random}-${timestamp}`
  }
}

// Global telemetry instance
export const telemetry: Telemetry = new Telemetry()
