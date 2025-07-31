import process from 'node:process'

export const processArgs: string[] = process.argv

export const platformInfo: string = `${process.platform}-${process.arch} bun-v${typeof Bun !== 'undefined' ? Bun.version : 'unknown'}`
