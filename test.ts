import pc from 'picocolors'
import { log } from './packages/ts/src/prompts/log'
import { progress } from './packages/ts/src/prompts/progress-bar'
import { spinner } from './packages/ts/src/prompts/spinner'
import { box, panel, setAccessibility, style, table } from './packages/ts/src/style'

// Force color support to be enabled regardless of environment
setAccessibility({ colors: true })

// Test a variety of style combinations
// eslint-disable-next-line no-console
console.log('Style Test:')
// eslint-disable-next-line no-console
console.log(style.red('This is red text'))
// eslint-disable-next-line no-console
console.log(style.blue('This is blue text'))
// eslint-disable-next-line no-console
console.log(style.green('This is green text'))
// eslint-disable-next-line no-console
console.log(style.yellow.bgBlue.bold('This is yellow text with blue background and bold'))
// eslint-disable-next-line no-console
console.log(style.bold.underline('This is bold and underlined text'))
// eslint-disable-next-line no-console
console.log(style.cyan.italic('This is cyan and italic text'))
// eslint-disable-next-line no-console
console.log(style.yellow.bold.bgRed('This is yellow bold text with red background'))

// Table example
// eslint-disable-next-line no-console
console.log('\nTable Example:')
table([
  ['Name', 'Age', 'City'],
  ['John', '28', 'New York'],
  ['Alice', '24', 'London'],
  ['Bob', '31', 'Paris'],
], { header: true, border: true })

// Box example
// eslint-disable-next-line no-console
console.log('\nBox Example:')
box('This is a sample content\nWith multiple lines\nIn a nice box', {
  title: 'Box Demo',
  padding: 1,
})

// Panel example
// eslint-disable-next-line no-console
console.log('\nPanel Example:')
panel({
  title: 'Panel Demo',
  content: 'This is a sample panel\nWith custom styling',
})

// Log examples
// eslint-disable-next-line no-console
console.log('\nLog Examples:')
log.info('This is an information message')
log.success('This is a success message')
log.warn('This is a warning message')
log.error('This is an error message')
log.custom('★', 'This is a custom log message', pc.cyan)

// Progress bar example (commented out as it requires time to demonstrate)
const bar = progress({
  max: 100,
})
bar.start('Loading')
for (let i = 0; i <= 100; i += 10) {
  bar.advance(10)
  // add a delay between updates
  // eslint-disable-next-line antfu/no-top-level-await
  await new Promise(resolve => setTimeout(resolve, 200))
}
bar.stop()

// Spinner example with progressive dots
// eslint-disable-next-line no-console
console.log('\nSpinner Example:')
const spin = spinner()
spin.start('Processing')

// Complete the spinner after 6 seconds
setTimeout(() => {
  spin.stop('Processing complete')
}, 6000)
