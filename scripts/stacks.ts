#!/usr/bin/env bun
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { cli } from '../packages/ts/src'
import {
  confirm,
  log,
  // note,
  // select,
  text,
} from '../packages/ts/src/prompts'

// Define the main CLI
const stacks = cli('stacks')

// Create custom log functions to maintain compatibility
// with the existing code (our prompts now handle markdown directly)
const customLog = {
  ...log,
  info: (message: string) => {
    log.info(message)
  },
  success: (message: string) => {
    log.success(message)
  },
  error: (message: string) => {
    log.error(message)
  },
  warn: (message: string) => {
    log.warn(message)
  },
}

stacks.command('create', 'Create a new Stacks project')
  .action(async () => {
    // Prompt for project name
    const name = await text({
      message: 'What is the name of your project?',
      placeholder: 'my-stacks-app',
    })

    if (typeof name === 'symbol')
      return

    // Collect project configuration
    const config: {
      name: string
      ui: boolean
      components: boolean
      webComponents: boolean
      vue: boolean
      views: boolean
      functions: boolean
      api: boolean
      database: boolean
      notifications: boolean
      cache: boolean
      email: boolean
      project: string | null
    } = {
      name: name as string,
      ui: false,
      components: false,
      webComponents: false,
      vue: false,
      views: false,
      functions: false,
      api: false,
      database: false,
      notifications: false,
      cache: false,
      email: false,
      project: null,
    }

    // UI
    const ui = await confirm({
      message: 'Are you building a UI?',
      initialValue: false,
    })

    if (typeof ui === 'symbol')
      return
    config.ui = ui as boolean

    // If UI is true, ask about components, web components, and Vue
    if (config.ui) {
      // Components
      const components = await confirm({
        message: 'Are you building UI components?',
        initialValue: false,
      })

      if (typeof components === 'symbol')
        return
      config.components = components as boolean

      if (config.components) {
        // Web Components
        const webComponents = await confirm({
          message: 'Automagically built optimized custom elements/web components?',
          initialValue: false,
        })

        if (typeof webComponents === 'symbol')
          return
        config.webComponents = webComponents as boolean

        // Vue
        const vue = await confirm({
          message: 'Automagically build a Vue component library?',
          initialValue: false,
        })

        if (typeof vue === 'symbol')
          return
        config.vue = vue as boolean
      }

      // Views
      const views = await confirm({
        message: 'How about views?',
        initialValue: false,
      })

      if (typeof views === 'symbol')
        return
      config.views = views as boolean
    }

    // Functions/composables
    const functions = await confirm({
      message: 'Are you developing functions/composables?',
      initialValue: false,
    })

    if (typeof functions === 'symbol')
      return
    config.functions = functions as boolean

    // API
    const api = await confirm({
      message: 'Are you building an API?',
      initialValue: false,
    })

    if (typeof api === 'symbol')
      return
    config.api = api as boolean

    // Database
    const database = await confirm({
      message: 'Do you need a database?',
      initialValue: false,
    })

    if (typeof database === 'symbol')
      return
    config.database = database as boolean

    // Notifications
    const notifications = await confirm({
      message: 'Do you need notifications? _(e.g. email, SMS, push or chat notifications)_',
      initialValue: false,
    })

    if (typeof notifications === 'symbol')
      return
    config.notifications = notifications as boolean

    // Cache
    const cache = await confirm({
      message: 'Do you need caching?',
      initialValue: false,
    })

    if (typeof cache === 'symbol')
      return
    config.cache = cache as boolean

    // Email
    const email = await confirm({
      message: 'Do you need email?',
      initialValue: false,
    })

    if (typeof email === 'symbol')
      return
    config.email = email as boolean

    // Target specific project
    const setProject = await confirm({
      message: 'Target a specific project?',
      initialValue: false,
    })

    if (typeof setProject === 'symbol')
      return

    if (setProject as boolean) {
      const project = await text({
        message: 'Enter the project name',
        placeholder: 'default',
      })

      if (typeof project === 'symbol')
        return
      config.project = project as string
    }

    // Create project using gitit
    await createProject(config)
  })

async function createProject(config: {
  name: string
  ui: boolean
  components: boolean
  webComponents: boolean
  vue: boolean
  views: boolean
  functions: boolean
  api: boolean
  database: boolean
  notifications: boolean
  cache: boolean
  email: boolean
  project: string | null
}) {
  const projectDir = path.join(process.cwd(), config.name)

  // Create project directory
  customLog.info(`Creating project directory: _${projectDir}_`)

  try {
    // Import downloadTemplate dynamically to avoid installation issues
    const { downloadTemplate } = await import('@stacksjs/gitit')

    // Create configuration file
    const configFile = path.join(process.cwd(), '.stacks-config.json')
    const stacksConfig = {
      ui: config.ui,
      components: config.components,
      webComponents: config.webComponents,
      vue: config.vue,
      views: config.views,
      functions: config.functions,
      api: config.api,
      database: config.database,
      notifications: config.notifications,
      cache: config.cache,
      email: config.email,
      project: config.project,
    }

    fs.writeFileSync(configFile, JSON.stringify(stacksConfig, null, 2))
    customLog.info('Created configuration file for the Stacks template')

    // Download the template using the gitit library
    customLog.info(`Downloading template: _github:stacksjs/stacks_`)

    // Store the downloadTemplate result to use it later if needed
    await downloadTemplate('github:stacksjs/stacks', {
      dir: projectDir,
      forceClean: fs.existsSync(projectDir),
      install: false, // We'll let the user run npm install themselves
      hooks: {
        // Add hook to debug output
        afterExtract: (result) => {
          customLog.info(`Template extracted to _${result.dir}_`)
          return result
        },
      },
    })

    // Clean up config file
    if (fs.existsSync(configFile)) {
      fs.unlinkSync(configFile)
    }

    customLog.success(`Project ${config.name} created successfully using Stacks template!

_To get started:_
  cd ${config.name}
  bun install
  bun run dev`)
  }
  catch (error: any) {
    customLog.error(`Failed to create project: ${error.message}`)
    customLog.info('To install gitit manually: _bun install -g @stacksjs/gitit_')
  }
}

// Parse the command line arguments and run the CLI
stacks.help()
stacks.parse()
