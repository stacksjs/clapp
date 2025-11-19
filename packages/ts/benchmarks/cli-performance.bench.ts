/**
 * CLI Performance Benchmarks
 *
 * Run with: bun test benchmarks/cli-performance.bench.ts
 */

import { bench, describe } from 'bun:test'
import { cli } from '../src/CLI'
import { cliCache } from '../src/cache'

describe('CLI Performance', () => {
  bench('CLI instantiation', () => {
    const testCli = cli('test')
  })

  bench('Command registration (10 commands)', () => {
    const testCli = cli('test')
    for (let i = 0; i < 10; i++) {
      testCli.command(`cmd${i}`, `Description ${i}`)
    }
  })

  bench('Command registration with options (10 commands)', () => {
    const testCli = cli('test')
    for (let i = 0; i < 10; i++) {
      testCli
        .command(`cmd${i}`, `Description ${i}`)
        .option('-f, --flag', 'Flag option')
        .option('-v, --value <value>', 'Value option')
    }
  })

  bench('Help text generation', () => {
    const testCli = cli('test')
    testCli.command('test', 'Test command')
    testCli.help()
    // Trigger help generation but don't output
    testCli.globalCommand.outputHelp = function () {
      // Capture help generation time
    }
  })
})

describe('Cache Performance', () => {
  bench('Cache set (1000 items)', () => {
    for (let i = 0; i < 1000; i++) {
      cliCache.set(`key${i}`, `value${i}`, 5000)
    }
  })

  bench('Cache get (1000 items)', () => {
    // Pre-populate
    for (let i = 0; i < 1000; i++) {
      cliCache.set(`key${i}`, `value${i}`, 5000)
    }

    // Benchmark retrieval
    for (let i = 0; i < 1000; i++) {
      cliCache.get(`key${i}`)
    }
  })

  bench('Cache has (1000 items)', () => {
    // Pre-populate
    for (let i = 0; i < 1000; i++) {
      cliCache.set(`key${i}`, `value${i}`, 5000)
    }

    // Benchmark existence checks
    for (let i = 0; i < 1000; i++) {
      cliCache.has(`key${i}`)
    }
  })

  bench('Cache cleanup (1000 items)', () => {
    // Pre-populate with expired items
    for (let i = 0; i < 1000; i++) {
      cliCache.set(`key${i}`, `value${i}`, 1) // 1ms TTL
    }

    // Wait for expiration
    Bun.sleepSync(2)

    // Benchmark cleanup
    cliCache.cleanup()
  })
})

describe('Namespace Extraction', () => {
  bench('Namespace extraction (1000 commands)', () => {
    const testCli = cli('test')
    for (let i = 0; i < 1000; i++) {
      // This will trigger namespace extraction
      testCli.command(`make:model${i}`, 'Make a model')
    }
  })
})

describe('Argument Parsing', () => {
  bench('Parse simple args (no options)', () => {
    const testCli = cli('test')
    testCli.command('test <arg1> <arg2>', 'Test command')
      .action(() => {})
    testCli.parse(['node', 'cli', 'test', 'value1', 'value2'], { run: false })
  })

  bench('Parse args with multiple options', () => {
    const testCli = cli('test')
    testCli.command('test <arg>', 'Test command')
      .option('-f, --flag', 'Flag')
      .option('-v, --verbose', 'Verbose')
      .option('--value <value>', 'Value')
      .action(() => {})
    testCli.parse(['node', 'cli', 'test', 'arg', '--flag', '--verbose', '--value', '123'], { run: false })
  })
})
