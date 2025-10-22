/* eslint-disable no-console */
export interface Styler {
  // Basic colors
  red: StylerFunction
  green: StylerFunction
  blue: StylerFunction
  yellow: StylerFunction
  cyan: StylerFunction
  magenta: StylerFunction
  white: StylerFunction
  gray: StylerFunction

  // Background colors
  bgRed: StylerFunction
  bgGreen: StylerFunction
  bgBlue: StylerFunction
  bgYellow: StylerFunction
  bgCyan: StylerFunction
  bgMagenta: StylerFunction

  // Text decorations
  bold: StylerFunction
  /**
   * Italicize text within your CLI.
   */
  italic: StylerFunction
  underline: StylerFunction
  dim: StylerFunction
  inverse: StylerFunction
  hidden: StylerFunction
  strikethrough: StylerFunction

  // Theme colors (when theme is applied)
  primary: StylerFunction
  secondary: StylerFunction
  success: StylerFunction
  warning: StylerFunction
  error: StylerFunction
  info: StylerFunction
  muted: StylerFunction

  // Feature detection
  supportsColor: boolean

  // Allow chaining of styles
  [key: string]: StylerFunction | boolean
}

export interface StylerFunction {
  (text: string): string
  [key: string]: StylerFunction
}

// ANSI color codes
export const codes: Record<string, [string, string]> = {
  // Text colors
  red: ['\x1B[31m', '\x1B[39m'],
  green: ['\x1B[32m', '\x1B[39m'],
  blue: ['\x1B[34m', '\x1B[39m'],
  yellow: ['\x1B[33m', '\x1B[39m'],
  cyan: ['\x1B[36m', '\x1B[39m'],
  magenta: ['\x1B[35m', '\x1B[39m'],
  white: ['\x1B[37m', '\x1B[39m'],
  gray: ['\x1B[90m', '\x1B[39m'],

  // Background colors
  bgRed: ['\x1B[41m', '\x1B[49m'],
  bgGreen: ['\x1B[42m', '\x1B[49m'],
  bgBlue: ['\x1B[44m', '\x1B[49m'],
  bgYellow: ['\x1B[43m', '\x1B[49m'],
  bgCyan: ['\x1B[46m', '\x1B[49m'],
  bgMagenta: ['\x1B[45m', '\x1B[49m'],

  // Text decorations
  bold: ['\x1B[1m', '\x1B[22m'],
  italic: ['\x1B[3m', '\x1B[23m'],
  underline: ['\x1B[4m', '\x1B[24m'],
  dim: ['\x1B[2m', '\x1B[22m'],
  inverse: ['\x1B[7m', '\x1B[27m'],
  hidden: ['\x1B[8m', '\x1B[28m'],
  strikethrough: ['\x1B[9m', '\x1B[29m'],
}

// Theme defaults (populated via setTheme)
const theme = {
  primary: 'blue',
  secondary: 'cyan',
  success: 'green',
  warning: 'yellow',
  error: 'red',
  info: 'magenta',
  muted: 'gray',
} as Record<string, string>

// Feature detection for color support
function detectColorSupport(): boolean {
  // Always enable colors for our implementation
  return true
}

// New styling implementation with proper chaining
function createStyler(): Styler {
  const styler = {} as Styler
  styler.supportsColor = detectColorSupport()

  // Simplified style function creator
  function createStyleFunction(styleName: string, styles: string[] = []): StylerFunction {
    const styleList = styleName === '' ? [] : [...styles, styleName]

    // The actual styling function
    const fn = function (text: string): string {
      if (!styler.supportsColor)
        return text

      // Apply all styles from the chain
      let openCodes = ''
      let closeCodes = ''

      for (const style of styleList) {
        // Handle theme styles
        if (style in theme && theme[style] in codes) {
          const themeStyle = theme[style]
          openCodes += codes[themeStyle][0]
          closeCodes = codes[themeStyle][1] + closeCodes
        }
        // Handle regular styles
        else if (style in codes) {
          openCodes += codes[style][0]
          closeCodes = codes[style][1] + closeCodes
        }
      }

      return openCodes + text + closeCodes
    } as StylerFunction

    // Add all style properties to the function for chaining
    const allStyles = [...Object.keys(codes), ...Object.keys(theme)]
    for (const style of allStyles) {
      if (!(style in fn)) {
        Object.defineProperty(fn, style, {
          get() {
            return createStyleFunction(style, styleList)
          },
        })
      }
    }

    return fn
  }

  // Initialize with all available styles
  const allStyles = [...Object.keys(codes), ...Object.keys(theme)]
  for (const style of allStyles) {
    if (!(style in styler)) {
      Object.defineProperty(styler, style, {
        get() {
          return createStyleFunction(style)
        },
      })
    }
  }

  return styler
}

export const style: Styler = createStyler()

// Function to set custom theme
export function setTheme(customTheme: Partial<Record<string, string>>): void {
  // Safely merge the theme without type errors
  for (const key in customTheme) {
    if (customTheme[key] !== undefined) {
      theme[key] = customTheme[key] as string
    }
  }
}

// Function to set accessibility options
export function setAccessibility(options: { colors?: boolean, emoji?: boolean, ascii?: boolean }): void {
  if (options.colors !== undefined) {
    style.supportsColor = options.colors
  }
}

// Box and panel function placeholders (full implementation would be more complex)
export function box(content: string, options?: { padding?: number, borderColor?: string, title?: string }): void {
  // Simplified implementation
  const title = options?.title ? ` ${options.title} ` : ''
  const padding = options?.padding || 0
  const paddingStr = ' '.repeat(padding)

  const lines = content.split('\n')
  // Calculate width based on content length plus padding
  const contentWidth = Math.max(...lines.map(line => line.length))
  const innerWidth = contentWidth + (padding * 2)

  // Total width is the content width plus padding on both sides
  const totalWidth = innerWidth

  // Top border with title

  console.log(`┌${title ? '─'.repeat(Math.floor((totalWidth - title.length) / 2)) + title + '─'.repeat(Math.ceil((totalWidth - title.length) / 2)) : '─'.repeat(totalWidth)}┐`)

  // Empty line after top border

  console.log(`│${' '.repeat(totalWidth)}│`)

  // Content lines with padding
  for (const line of lines) {
    // Calculate right padding to align the right border
    const rightPadding = innerWidth - line.length - padding

    console.log(`│${paddingStr}${line}${' '.repeat(rightPadding)}│`)
  }

  // Empty line before bottom border

  console.log(`│${' '.repeat(totalWidth)}│`)

  // Bottom border

  console.log(`└${'─'.repeat(totalWidth)}┘`)
}

export function panel(options: { title?: string, content: string, borderColor?: string }): void {
  // Use different border style for panel to distinguish from box
  const title = options?.title ? ` ${options.title} ` : ''
  const content = options.content
  const lines = content.split('\n')

  // Calculate width based on content length plus margins
  const contentWidth = Math.max(...lines.map(line => line.length))
  const innerWidth = contentWidth + 2 // +2 for the space on each side

  // Top border with title - using double line for panels

  console.log(`╔${title ? '═'.repeat(Math.floor((innerWidth - title.length) / 2)) + title + '═'.repeat(Math.ceil((innerWidth - title.length) / 2)) : '═'.repeat(innerWidth)}╗`)

  // Empty line after top border

  console.log(`║${' '.repeat(innerWidth)}║`)

  // Content lines
  for (const line of lines) {
    // Calculate right padding to align the right border
    const rightPadding = innerWidth - line.length - 1

    console.log(`║ ${line}${' '.repeat(rightPadding)}║`)
  }

  // Empty line before bottom border

  console.log(`║${' '.repeat(innerWidth)}║`)

  // Bottom border

  console.log(`╚${'═'.repeat(innerWidth)}╝`)
}

export function table(data: string[][], options?: { border?: boolean, header?: boolean, align?: ('left' | 'right' | 'center')[] }): void {
  // Simple implementation for demonstration
  if (!data || data.length === 0)
    return

  // Calculate column widths
  const colWidths: number[] = Array.from({ length: data[0].length }, () => 0)
  for (const row of data) {
    for (let i = 0; i < row.length; i++) {
      colWidths[i] = Math.max(colWidths[i], String(row[i]).length)
    }
  }

  // Draw top border
  if (options?.border) {
    console.log(`┌${colWidths.map((w: number) => '─'.repeat(w + 2)).join('┬')}┐`)
  }

  // Draw header
  if (options?.header && data.length > 0) {
    console.log(
      (options.border ? '│ ' : '')
      + data[0].map((cell: string, i: number) => `${cell}${' '.repeat(colWidths[i] - String(cell).length)}`).join(' │ ')
      + (options.border ? ' │' : ''),
    )

    if (options.border) {
      console.log(`├${colWidths.map((w: number) => '─'.repeat(w + 2)).join('┼')}┤`)
    }
    else {
      console.log(`${colWidths.map((w: number) => '─'.repeat(w)).join('─┼─')}`)
    }
  }

  // Draw data rows
  const startRow = options?.header ? 1 : 0
  for (let r = startRow; r < data.length; r++) {
    console.log(
      (options?.border ? '│ ' : '')
      + data[r].map((cell: string, i: number) => `${cell}${' '.repeat(colWidths[i] - String(cell).length)}`).join(' │ ')
      + (options?.border ? ' │' : ''),
    )
  }

  // Draw bottom border
  if (options?.border) {
    console.log(`└${colWidths.map((w: number) => '─'.repeat(w + 2)).join('┴')}┘`)
  }
}
