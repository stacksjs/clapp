import type { CommonOptions } from './common'
import { spinner } from './spinner'

export interface Task {
  /**
   * Task title
   */
  title: string
  /**
   * Task function
   */
  task: (message: (string: string) => void) => string | Promise<string> | void | Promise<void>

  /**
   * If enabled === false the task will be skipped
   */
  enabled?: boolean
}

/**
 * Define a group of tasks to be executed
 */
export async function tasks(tasks: Task[], opts?: CommonOptions): Promise<void> {
  for (const task of tasks) {
    if (task.enabled === false)
      continue

    const s = spinner(opts)
    s.start(task.title)
    const result = await task.task(s.message)
    s.stop(result || task.title)
  }
}
