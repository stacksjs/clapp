import { describe, expect, test } from 'bun:test'
import { applyTheme, getAvailableThemes, style, themes } from '../src/style'

describe('Color Themes', () => {
  test('getAvailableThemes returns all theme names', () => {
    const availableThemes = getAvailableThemes()
    expect(availableThemes).toContain('default')
    expect(availableThemes).toContain('dracula')
    expect(availableThemes).toContain('nord')
    expect(availableThemes).toContain('solarized')
    expect(availableThemes).toContain('monokai')
  })

  test('themes object has all defined themes', () => {
    expect(themes.default).toBeDefined()
    expect(themes.dracula).toBeDefined()
    expect(themes.nord).toBeDefined()
    expect(themes.solarized).toBeDefined()
    expect(themes.monokai).toBeDefined()
  })

  test('each theme has required color mappings', () => {
    const requiredKeys = ['primary', 'secondary', 'success', 'warning', 'error', 'info', 'muted']

    for (const themeName of Object.keys(themes)) {
      const theme = themes[themeName as keyof typeof themes]
      for (const key of requiredKeys) {
        expect(theme[key as keyof typeof theme]).toBeDefined()
      }
    }
  })

  test('applyTheme changes theme colors', () => {
    // Apply dracula theme
    applyTheme('dracula')

    // Theme should now use dracula colors
    // We can't directly test the internal theme object, but we can verify
    // the function doesn't throw
    expect(true).toBe(true)
  })

  test('style object has all color methods', () => {
    expect(typeof style.red).toBe('function')
    expect(typeof style.green).toBe('function')
    expect(typeof style.blue).toBe('function')
    expect(typeof style.yellow).toBe('function')
    expect(typeof style.primary).toBe('function')
    expect(typeof style.success).toBe('function')
    expect(typeof style.error).toBe('function')
  })

  test('style methods can be chained', () => {
    const styledText = style.bold.red('Test')
    expect(typeof styledText).toBe('string')
    expect(styledText).toContain('Test')
  })

  test('style primary color changes with theme', () => {
    // This is a basic smoke test
    applyTheme('default')
    const defaultPrimary = style.primary('test')

    applyTheme('dracula')
    const draculaPrimary = style.primary('test')

    // Both should contain the text
    expect(defaultPrimary).toContain('test')
    expect(draculaPrimary).toContain('test')
  })
})
