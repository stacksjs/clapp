import type CAC from './CLI'
import type { OptionConfig } from './Option'
import Option from './Option'
import { platformInfo as bunPlatformInfo } from './runtimes/bun'
import { platformInfo as nodePlatformInfo } from './runtimes/node'
import {
  ClappError,
  findAllBrackets,
  findLongest,
  findSimilarCommands,
  padRight,
  removeBrackets,
} from './utils'

interface CommandArg {
  required: boolean
  value: string
  variadic: boolean
}

interface HelpSection {
  title?: string
  body: string
}

interface CommandConfig {
  allowUnknownOptions?: boolean
  ignoreOptionDefaultValue?: boolean
}

type HelpCallback = (sections: HelpSection[]) => void | HelpSection[]

type CommandExample = ((bin: string) => string) | string

export type HookHandler = (context: HookContext) => void | Promise<void>

export interface HookContext {
  command: Command
  args: any[]
  options: any
  next?: () => void | Promise<void>
}

export class Command {
  options: Option[]
  aliasNames: string[]
  /* Parsed command name */
  name: string
  /* Command namespace (e.g., 'make' for 'make:model') */
  namespace?: string
  args: CommandArg[]
  commandAction?: (...args: any[]) => any
  usageText?: string
  versionNumber?: string
  examples: CommandExample[]
  helpCallback?: HelpCallback
  globalCommand?: GlobalCommand
  beforeHooks: HookHandler[]
  afterHooks: HookHandler[]
  middleware: HookHandler[]

  constructor(
    public rawName: string,
    public description: string,
    public config: CommandConfig,
    public cli: CAC,
  ) {
    this.options = []
    this.aliasNames = []
    this.name = removeBrackets(rawName)

    // Extract namespace from command name (e.g., 'make:model' -> namespace='make', name='model')
    const nameWithoutBrackets = removeBrackets(rawName)
    const colonIndex = nameWithoutBrackets.indexOf(':')
    if (colonIndex > 0) {
      this.namespace = nameWithoutBrackets.substring(0, colonIndex)
      this.name = nameWithoutBrackets.substring(colonIndex + 1)
    }

    this.args = findAllBrackets(rawName)
    this.examples = []
    this.beforeHooks = []
    this.afterHooks = []
    this.middleware = []

    // Set default value for config if it's undefined
    if (!config) {
      this.config = {}
    }
  }

  usage(text: string): this {
    this.usageText = text
    return this
  }

  allowUnknownOptions(): this {
    this.config.allowUnknownOptions = true
    return this
  }

  ignoreOptionDefaultValue(): this {
    this.config.ignoreOptionDefaultValue = true
    return this
  }

  version(version: string, customFlags = '-v, --version'): this {
    this.versionNumber = version
    this.option(customFlags, 'Display version number')
    return this
  }

  example(example: CommandExample): this {
    this.examples.push(example)
    return this
  }

  /**
   * Add a option for this command
   * @param rawName Raw option name(s)
   * @param description Option description
   * @param config Option config
   */
  option(rawName: string, description: string, config?: OptionConfig): this {
    const option = new Option(rawName, description, config)
    this.options.push(option)
    return this
  }

  alias(name: string): this {
    this.aliasNames.push(name)
    return this
  }

  action(callback: (...args: any[]) => any): this {
    this.commandAction = callback
    return this
  }

  /**
   * Register a before hook that runs before command execution
   * @param handler Hook handler function
   */
  before(handler: HookHandler): this {
    this.beforeHooks.push(handler)
    return this
  }

  /**
   * Register an after hook that runs after command execution
   * @param handler Hook handler function
   */
  after(handler: HookHandler): this {
    this.afterHooks.push(handler)
    return this
  }

  /**
   * Register middleware that wraps command execution
   * @param handler Middleware handler function (must call next())
   */
  use(handler: HookHandler): this {
    this.middleware.push(handler)
    return this
  }

  /**
   * Check if a command name is matched by this command
   * @param name Command name
   */
  isMatched(name: string): boolean {
    return this.name === name || this.aliasNames.includes(name)
  }

  get isDefaultCommand(): boolean {
    return this.name === '' || this.aliasNames.includes('!')
  }

  get isGlobalCommand(): boolean {
    return this instanceof GlobalCommand
  }

  /**
   * Check if an option is registered in this command
   * @param name Option name
   */
  hasOption(name: string): boolean {
    name = name.split('.')[0]
    return !!this.options.find((option) => {
      return option.names.includes(name)
    })
  }

  outputHelp(): void {
    const { name, commands } = this.cli
    const {
      versionNumber,
      options: globalOptions,
      helpCallback,
    } = this.cli.globalCommand

    let sections: HelpSection[] = [
      {
        body: `${name}${versionNumber ? `/${versionNumber}` : ''}`,
      },
    ]

    sections.push({
      title: 'Usage',
      body: `  $ ${name} ${this.usageText || this.rawName}`,
    })

    const showCommands
      = (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0

    if (showCommands) {
      const longestCommandName = findLongest(
        commands.map(command => command.rawName),
      )

      // Group commands by namespace
      const namespaceGroups = new Map<string, typeof commands>()
      const noNamespaceCommands: typeof commands = []

      for (const command of commands) {
        if (command.namespace) {
          if (!namespaceGroups.has(command.namespace)) {
            namespaceGroups.set(command.namespace, [])
          }
          namespaceGroups.get(command.namespace)!.push(command)
        }
        else {
          noNamespaceCommands.push(command)
        }
      }

      // Display commands grouped by namespace
      let commandBody = ''

      // First show commands without namespace
      if (noNamespaceCommands.length > 0) {
        commandBody += noNamespaceCommands
          .map((command) => {
            return `  ${padRight(
              command.rawName,
              longestCommandName.length,
            )}  ${command.description}`
          })
          .join('\n')
      }

      // Then show namespaced commands
      const sortedNamespaces = Array.from(namespaceGroups.keys()).sort()
      for (const namespace of sortedNamespaces) {
        const namespaceCommands = namespaceGroups.get(namespace)!
        if (commandBody.length > 0) {
          commandBody += '\n\n'
        }
        commandBody += `  ${namespace}:\n`
        commandBody += namespaceCommands
          .map((command) => {
            return `    ${padRight(
              command.rawName,
              longestCommandName.length - 2,
            )}  ${command.description}`
          })
          .join('\n')
      }

      sections.push({
        title: 'Commands',
        body: commandBody,
      })
      sections.push({
        title: `For more info, run any command with the \`--help\` flag`,
        body: commands
          .map(
            command =>
              `  $ ${name}${
                command.name === '' ? '' : ` ${command.name}`
              } --help`,
          )
          .join('\n'),
      })
    }

    let options = this.isGlobalCommand
      ? globalOptions
      : [...this.options, ...(globalOptions || [])]
    if (!this.isGlobalCommand && !this.isDefaultCommand) {
      options = options.filter(option => option.name !== 'version')
    }
    if (options.length > 0) {
      const longestOptionName = findLongest(
        options.map(option => option.rawName),
      )
      sections.push({
        title: 'Options',
        body: options
          .map((option) => {
            return `  ${padRight(option.rawName, longestOptionName.length)}  ${
              option.description
            } ${
              option.config.default === undefined
                ? ''
                : `(default: ${option.config.default})`
            }`
          })
          .join('\n'),
      })
    }

    if (this.examples.length > 0) {
      sections.push({
        title: 'Examples',
        body: this.examples
          .map((example) => {
            if (typeof example === 'function') {
              return example(name)
            }
            return example
          })
          .join('\n'),
      })
    }

    if (helpCallback) {
      sections = helpCallback(sections) || sections
    }

    // eslint-disable-next-line no-console
    console.log(
      sections
        .map((section) => {
          return section.title
            ? `${section.title}:\n${section.body}`
            : section.body
        })
        .join('\n\n'),
    )
  }

  outputVersion(): void {
    const { name } = this.cli
    const { versionNumber } = this.cli.globalCommand
    if (versionNumber) {
      // first, check if bun is used
      let platformInfo
      if (Bun) {
        platformInfo = bunPlatformInfo
      }
      else {
        platformInfo = nodePlatformInfo
      }
      // eslint-disable-next-line no-console
      console.log(`${name}/${versionNumber} ${platformInfo}`)
    }
  }

  checkRequiredArgs(): void {
    const minimalArgsCount = this.args.filter(arg => arg.required).length

    if (this.cli.args.length < minimalArgsCount) {
      const requiredArgs = this.args.filter(arg => arg.required)
      const missingArgs = requiredArgs.slice(this.cli.args.length)
      const argNames = missingArgs.map(arg => `<${arg.value}>`).join(' ')

      throw new ClappError(
        `Missing required argument${missingArgs.length > 1 ? 's' : ''}: ${argNames}\n\n`
        + `Run \`${this.cli.name} ${this.rawName} --help\` for usage information.`,
      )
    }
  }

  /**
   * Check if the parsed options contain any unknown options
   *
   * Exit and output error when true
   */
  checkUnknownOptions(): void {
    const { options, globalCommand } = this.cli

    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (
          name !== '--'
          && !this.hasOption(name)
          && !globalCommand.hasOption(name)
        ) {
          // Get all available option names for suggestions
          const allOptions = [...globalCommand.options, ...this.options]
          const allOptionNames = allOptions.flatMap(opt => opt.names)

          const optionFlag = name.length > 1 ? `--${name}` : `-${name}`
          const suggestions = findSimilarCommands(name, allOptionNames)

          let errorMsg = `Unknown option \`${optionFlag}\``

          if (suggestions.length > 0) {
            errorMsg += '\n\nDid you mean one of these?'
            suggestions.forEach((suggestion) => {
              const suggestedFlag = suggestion.length > 1 ? `--${suggestion}` : `-${suggestion}`
              errorMsg += `\n  • ${suggestedFlag}`
            })
          }

          errorMsg += `\n\nRun \`${this.cli.name} ${this.rawName} --help\` to see available options.`

          throw new ClappError(errorMsg)
        }
      }
    }
  }

  /**
   * Check if the required string-type options exist
   */
  checkOptionValue(): void {
    const { options: parsedOptions, globalCommand } = this.cli
    const options = [...globalCommand.options, ...this.options]
    for (const option of options) {
      const value = parsedOptions[option.name.split('.')[0]]
      // Check required option value
      if (option.required) {
        const hasNegated = options.some(
          o => o.negated && o.names.includes(option.name),
        )
        if (value === true || (value === false && !hasNegated)) {
          throw new ClappError(
            `Option \`${option.rawName}\` requires a value.\n\n`
            + `Example: ${this.cli.name} ${this.rawName} ${option.rawName} <value>`,
          )
        }
      }
    }
  }
}

class GlobalCommand extends Command {
  constructor(cli: CAC) {
    super('@@global@@', '', {}, cli)
  }
}

export type { CommandConfig, CommandExample, HelpCallback }

export { GlobalCommand }

export default Command
