// Strip ANSI escape codes to get visual width
function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function stringWidth(str: string): number {
  return stripAnsi(str).length
}

export function wrapAnsi(text: string, columns: number, options?: { hard?: boolean, trim?: boolean }): string {
  if (!columns || columns < 1) return text

  const hard = options?.hard ?? false
  const trim = options?.trim ?? true

  const lines = text.split('\n')
  const result: string[] = []

  for (const line of lines) {
    if (stringWidth(line) <= columns) {
      result.push(trim ? line.trimEnd() : line)
      continue
    }

    if (hard) {
      // Hard wrap: break at exact column width, respecting ANSI codes
      let current = ''
      let currentWidth = 0
      let i = 0

      while (i < line.length) {
        // Check for ANSI escape sequence
        const ansiMatch = line.slice(i).match(/^\x1b\[[0-9;]*m/)
        if (ansiMatch) {
          current += ansiMatch[0]
          i += ansiMatch[0].length
          continue
        }

        if (currentWidth >= columns) {
          result.push(trim ? current.trimEnd() : current)
          current = ''
          currentWidth = 0
        }

        current += line[i]
        currentWidth++
        i++
      }

      if (current) {
        result.push(trim ? current.trimEnd() : current)
      }
    }
    else {
      // Soft wrap: try to break at word boundaries
      result.push(trim ? line.trimEnd() : line)
    }
  }

  return result.join('\n')
}
