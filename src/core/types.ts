import type { Key } from 'node:readline'
import type { Action } from '../utils/settings'

/**
 * The state of the prompt
 */
export type ClappState = 'initial' | 'active' | 'cancel' | 'submit' | 'error'

/**
 * Typed event emitter for clack
 */
export interface ClappEvents<TValue> {
  initial: (value?: any) => void
  active: (value?: any) => void
  cancel: (value?: any) => void
  submit: (value?: any) => void
  error: (value?: any) => void
  cursor: (key?: Action) => void
  key: (key: string | undefined, info: Key) => void
  value: (value?: TValue) => void
  userInput: (value: string) => void
  confirm: (value?: boolean) => void
  finalize: () => void
  beforePrompt: () => void
}
