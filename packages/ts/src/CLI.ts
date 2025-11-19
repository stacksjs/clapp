import type { CommandConfig, CommandExample, HelpCallback } from './Command'
import type { OptionConfig } from './Option'
import { EventEmitter } from 'node:events'
import mri from 'mri'
import Command, { GlobalCommand } from './Command'
import { processArgs } from './runtimes/node'
import { camelcaseOptionName, findSimilarCommands, getFileName, getMriOptions, setByType, setDotProp } from './utils'
import { style } from './style'

interface ParsedArgv {
  args: ReadonlyArray<string>
  options: {
    [k: string]: any
  }
}

export class CLI extends EventEmitter {
  /** The program name to display in help and version message */
  name: string
  commands: Command[]
  globalCommand: GlobalCommand
  matchedCommand?: Command
  matchedCommandName?: string
  /**
   * Raw CLI arguments
   */
  rawArgs: string[]
  /**
   * Parsed CLI arguments
   */
  args: ParsedArgv['args']
  /**
   * Parsed CLI options, camelCased
   */
  options: ParsedArgv['options']

  showHelpOnExit?: boolean
  showVersionOnExit?: boolean
  enableDidYouMean = true
  private signalHandlersSet = false

  /** Whether verbose mode is enabled */
  isVerbose = false

  /** Whether quiet mode is enabled */
  isQuiet = false

  /** Whether debug mode is enabled */
  isDebug = false

  /** Whether no-interaction mode is enabled (for CI/CD) */
  isNoInteraction = false

  /** Target environment */
  environment?: string

  /** Whether dry-run mode is enabled */
  isDryRun = false

  /** Whether force mode is enabled (skip confirmations) */
  isForce = false

  /** Whether emoji output is enabled */
  useEmoji = true

  /** Active color theme */
  theme?: string

  /** Whether caching is disabled */
  isNoCache = false

  /**
   * @param name The program name to display in help and version message
   */
  constructor(name = '') {
    super()
    this.name = name
    this.commands = []
    this.rawArgs = []
    this.args = []
    this.options = {}
    this.globalCommand = new GlobalCommand(this)
    this.globalCommand.usage('<command> [options]')
  }

  /**
   * Set up graceful signal handling for SIGINT and SIGTERM
   * @param cleanup Optional cleanup function to run before exit
   */
  handleSignals(cleanup?: () => void | Promise<void>): this {
    if (this.signalHandlersSet) {
      return this
    }

    const handleSignal = async (signal: string) => {
      console.log(`\n\nReceived ${signal}, cleaning up...`)

      if (cleanup) {
        try {
          await cleanup()
        }
        catch (error) {
          console.error('Error during cleanup:', error)
        }
      }

      process.exit(0)
    }

    process.on('SIGINT', () => handleSignal('SIGINT'))
    process.on('SIGTERM', () => handleSignal('SIGTERM'))

    this.signalHandlersSet = true
    return this
  }

  /**
   * Enable or disable "did you mean?" suggestions for unknown commands
   */
  didYouMean(enabled = true): this {
    this.enableDidYouMean = enabled
    return this
  }

  /**
   * Enable verbose mode global option (-v, --verbose)
   * This adds a global --verbose flag and sets isVerbose when used
   */
  verbose(): this {
    this.globalCommand.option('-v, --verbose', 'Enable verbose output')
    return this
  }

  /**
   * Enable quiet mode global option (-q, --quiet)
   * This adds a global --quiet flag and sets isQuiet when used
   */
  quiet(): this {
    this.globalCommand.option('-q, --quiet', 'Suppress non-essential output')
    return this
  }

  /**
   * Enable debug mode global option (--debug)
   * This adds a global --debug flag and sets isDebug when used
   * Provides detailed stack traces and diagnostic information
   */
  debug(): this {
    this.globalCommand.option('--debug', 'Enable debug mode with detailed error information')
    return this
  }

  /**
   * Enable no-interaction mode global option (-n, --no-interaction)
   * This adds a global flag for CI/CD environments and sets isNoInteraction when used
   * Disables all interactive prompts and confirmations
   */
  noInteraction(): this {
    this.globalCommand.option('-n, --no-interaction', 'Do not ask any interactive questions (for CI/CD)')
    return this
  }

  /**
   * Enable environment selection global option (--env)
   * This adds a global --env flag and sets environment when used
   * Allows targeting specific environments (e.g., production, staging, local)
   */
  env(): this {
    this.globalCommand.option('--env <environment>', 'Target environment (e.g., production, staging, local)')
    return this
  }

  /**
   * Enable dry-run mode global option (--dry-run)
   * This adds a global --dry-run flag and sets isDryRun when used
   * Allows previewing actions without executing them
   */
  dryRun(): this {
    this.globalCommand.option('--dry-run', 'Preview actions without executing them')
    return this
  }

  /**
   * Enable force mode global option (-f, --force)
   * This adds a global flag and sets isForce when used
   * Skips confirmation prompts for destructive operations
   */
  force(): this {
    this.globalCommand.option('-f, --force', 'Skip confirmation prompts')
    return this
  }

  /**
   * Enable emoji control global option (--no-emoji)
   * This adds a global flag and sets useEmoji when used
   * Allows disabling emoji in output
   */
  emoji(): this {
    this.globalCommand.option('--no-emoji', 'Disable emoji in output')
    return this
  }

  /**
   * Enable theme selection global option (--theme)
   * This adds a global --theme flag and sets theme when used
   * Allows selecting color themes (default, dracula, nord, solarized, monokai)
   */
  themes(): this {
    this.globalCommand.option('--theme <theme>', 'Color theme (default, dracula, nord, solarized, monokai)')
    return this
  }

  /**
   * Enable cache control global option (--no-cache)
   * This adds a global flag and sets isNoCache when used
   * Allows disabling caching for command metadata and help text
   */
  cache(): this {
    this.globalCommand.option('--no-cache', 'Disable caching')
    return this
  }

  /**
   * Add a global usage text.
   *
   * This is not used by sub-commands.
   */
  usage(text: string): this {
    this.globalCommand.usage(text)
    return this
  }

  /**
   * Add a sub-command
   */
  command(rawName: string, description?: string, config?: CommandConfig): Command {
    if (!config) {
      config = {}
    }

    const command = new Command(rawName, description || '', config, this)
    command.globalCommand = this.globalCommand
    this.commands.push(command)

    return command
  }

  /**
   * Add a global CLI option.
   *
   * Which is also applied to sub-commands.
   */
  option(rawName: string, description: string, config?: OptionConfig): this {
    this.globalCommand.option(rawName, description, config)
    return this
  }

  /**
   * Show help message when `-h, --help` flags appear.
   *
   */
  help(callback?: HelpCallback): this {
    this.globalCommand.option('-h, --help', 'Display this message')
    this.globalCommand.helpCallback = callback
    this.showHelpOnExit = true
    return this
  }

  /**
   * Show version number when `-v, --version` flags appear.
   *
   */
  version(version: string, customFlags = '-v, --version'): this {
    this.globalCommand.version(version, customFlags)
    this.showVersionOnExit = true
    return this
  }

  /**
   * Add a global example.
   *
   * This example added here will not be used by sub-commands.
   */
  example(example: CommandExample): this {
    this.globalCommand.example(example)
    return this
  }

  /**
   * Output the corresponding help message
   * When a sub-command is matched, output the help message for the command
   * Otherwise output the global one.
   *
   */
  outputHelp(): void {
    if (this.matchedCommand) {
      this.matchedCommand.outputHelp()
    }
    else {
      this.globalCommand.outputHelp()
    }
  }

  /**
   * Output the version number.
   *
   */
  outputVersion(): void {
    this.globalCommand.outputVersion()
  }

  private setParsedInfo(
    { args, options }: ParsedArgv,
    matchedCommand?: Command,
    matchedCommandName?: string,
  ) {
    this.args = args
    this.options = options
    if (matchedCommand) {
      this.matchedCommand = matchedCommand
    }
    if (matchedCommandName) {
      this.matchedCommandName = matchedCommandName
    }
    return this
  }

  unsetMatchedCommand(): void {
    this.matchedCommand = undefined
    this.matchedCommandName = undefined
  }

  /**
   * Show "did you mean?" error for unknown commands
   */
  showCommandNotFound(input: string): void {
    console.log(style.red(`\n✗ Command "${input}" not found.\n`))

    if (this.enableDidYouMean) {
      // Get all command names including aliases
      const allCommandNames: string[] = []
      for (const command of this.commands) {
        if (command.name) {
          allCommandNames.push(command.name)
        }
        if (command.aliasNames) {
          allCommandNames.push(...command.aliasNames)
        }
      }

      const suggestions = findSimilarCommands(input, allCommandNames)
      if (suggestions.length > 0) {
        console.log(style.yellow('Did you mean one of these?'))
        suggestions.forEach(cmd => console.log(`  ${style.dim('•')} ${this.name} ${cmd}`))
        console.log('')
      }
    }

    console.log(style.dim('Run'), `${this.name} --help`, style.dim('to see all available commands'))
    process.exit(1)
  }

  /**
   * Parse argv
   */
  async parse(
    argv: string[] = processArgs,
    {
      /** Whether to run the action for matched command */
      run = true,
    }: { run?: boolean } = {},
  ): Promise<ParsedArgv> {
    this.rawArgs = argv
    if (!this.name) {
      this.name = argv[1] ? getFileName(argv[1]) : 'cli'
    }

    let shouldParse = true

    // Search sub-commands
    for (const command of this.commands) {
      const parsed = this.mri(argv.slice(2), command)

      const commandName = parsed.args[0]
      if (command.isMatched(commandName)) {
        shouldParse = false
        const parsedInfo = {
          ...parsed,
          args: parsed.args.slice(1),
        }
        this.setParsedInfo(parsedInfo, command, commandName)
        this.emit(`command:${commandName}`, command)
      }
    }

    if (shouldParse) {
      // Search the default command
      for (const command of this.commands) {
        if (command.name === '') {
          shouldParse = false
          const parsed = this.mri(argv.slice(2), command)
          this.setParsedInfo(parsed, command)
          this.emit(`command:!`, command)
        }
      }
    }

    if (shouldParse) {
      const parsed = this.mri(argv.slice(2))
      this.setParsedInfo(parsed)
    }

    // Set verbose, quiet, and debug modes based on parsed options
    if (this.options.verbose) {
      this.isVerbose = true
    }
    if (this.options.quiet) {
      this.isQuiet = true
    }
    if (this.options.debug) {
      this.isDebug = true
    }
    if (this.options.noInteraction) {
      this.isNoInteraction = true
    }
    if (this.options.env) {
      this.environment = this.options.env
    }
    if (this.options.dryRun) {
      this.isDryRun = true
    }
    if (this.options.force) {
      this.isForce = true
    }
    if (this.options.noEmoji !== undefined) {
      this.useEmoji = !this.options.noEmoji
    }
    if (this.options.theme) {
      this.theme = this.options.theme
    }
    if (this.options.noCache !== undefined) {
      this.isNoCache = this.options.noCache
    }

    if (this.options.help && this.showHelpOnExit) {
      this.outputHelp()
      run = false
      this.unsetMatchedCommand()
    }

    if (this.options.version && this.showVersionOnExit && this.matchedCommandName == null) {
      this.outputVersion()
      run = false
      this.unsetMatchedCommand()
    }

    const parsedArgv = { args: this.args, options: this.options }

    if (run) {
      await this.runMatchedCommand()
    }

    if (!this.matchedCommand && this.args[0]) {
      this.emit('command:*')

      // Show "did you mean?" if command not found and no listener for command:*
      const hasWildcardListener = this.listenerCount('command:*') > 0
      if (!hasWildcardListener) {
        this.showCommandNotFound(this.args[0] as string)
      }
    }

    return parsedArgv
  }

  private mri(
    argv: string[],
    /** Matched command */ command?: Command,
  ): ParsedArgv {
    // All added options
    const cliOptions = [
      ...this.globalCommand.options,
      ...(command ? command.options : []),
    ]
    const mriOptions = getMriOptions(cliOptions)

    // Extract everything after `--` since mri doesn't support it
    let argsAfterDoubleDashes: string[] = []
    const doubleDashesIndex = argv.indexOf('--')
    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1)
      argv = argv.slice(0, doubleDashesIndex)
    }

    let parsed = mri(argv, mriOptions)
    parsed = Object.keys(parsed).reduce(
      (res, name) => {
        return {
          ...res,
          [camelcaseOptionName(name)]: parsed[name],
        }
      },
      { _: [] },
    )

    const args = parsed._

    const options: { [k: string]: any } = {
      '--': argsAfterDoubleDashes,
    }

    // Set option default value
    const ignoreDefault
      = command && command.config.ignoreOptionDefaultValue
        ? command.config.ignoreOptionDefaultValue
        : this.globalCommand.config.ignoreOptionDefaultValue

    const transforms = Object.create(null)

    for (const cliOption of cliOptions) {
      if (!ignoreDefault && cliOption.config.default !== undefined) {
        for (const name of cliOption.names) {
          options[name] = cliOption.config.default
        }
      }

      // If options type is defined
      if (Array.isArray(cliOption.config.type)) {
        if (transforms[cliOption.name] === undefined) {
          transforms[cliOption.name] = Object.create(null)

          transforms[cliOption.name].shouldTransform = true
          transforms[cliOption.name].transformFunction
            = cliOption.config.type[0]
        }
      }
    }

    // Set option values (support dot-nested property name)
    for (const key of Object.keys(parsed)) {
      if (key !== '_') {
        const keys = key.split('.')
        setDotProp(options, keys, parsed[key])
        setByType(options, transforms)
      }
    }

    return {
      args,
      options,
    }
  }

  async runMatchedCommand(): Promise<any> {
    const { args, options, matchedCommand: command } = this

    if (!command || !command.commandAction)
      return

    command.checkUnknownOptions()
    command.checkOptionValue()
    command.checkRequiredArgs()

    const actionArgs: any[] = []
    command.args.forEach((arg, index) => {
      if (arg.variadic) {
        actionArgs.push(args.slice(index))
      }
      else {
        actionArgs.push(args[index])
      }
    })

    actionArgs.push(options)

    const context = {
      command,
      args: actionArgs,
      options,
    }

    // Run before hooks
    for (const hook of command.beforeHooks) {
      await hook(context)
    }

    let actionResult: any

    // Build middleware chain
    const executeAction = async () => {
      const result = command.commandAction!.apply(this, actionArgs)
      if (result instanceof Promise) {
        actionResult = await result
      }
      else {
        actionResult = result
      }
      return actionResult
    }

    // Execute middleware chain
    if (command.middleware.length > 0) {
      let index = 0
      const next = async (): Promise<void> => {
        if (index < command.middleware.length) {
          const middleware = command.middleware[index++]
          await middleware({ ...context, next })
        }
        else {
          await executeAction()
        }
      }
      await next()
    }
    else {
      await executeAction()
    }

    // Run after hooks
    for (const hook of command.afterHooks) {
      await hook(context)
    }

    return actionResult
  }
}

/**
 * @param name The program name to display in help and version message
 */
export const cli = (name = ''): CLI => new CLI(name)

export default CLI
