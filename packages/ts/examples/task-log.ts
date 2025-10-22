import { setTimeout } from 'node:timers/promises'
import * as p from '../src'

async function main() {
  p.intro('task log start...')

  const log = p.taskLog({
    title: 'Running npm install',
    limit: 5,
  })

  for await (const line of fakeCommand()) {
    log.message(line)
  }

  log.success('Done!')

  p.outro('task log stop...')
}

async function* fakeCommand() {
  for (let i = 0; i < 100; i++) {
    yield `line \x1B[32m${i}\x1B[39m...`
    await setTimeout(80)
  }
}

main()
