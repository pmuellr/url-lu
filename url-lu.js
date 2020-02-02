#!/usr/bin/env node

'use strict'

const path = require('path')
const fs = require('fs')
const fsp = fs.promises

const meow = require('meow')

const { exit } = require('./lib/error')
const { debug } = require('./lib/debug')
const program = require('./lib/program')
const commands = require('./lib/commands')
const UrlDB = require('./lib/url-db')

// @ts-ignore
if (require.main === module) main()

// main cli function
async function main () {
  const args = parseArgs()
  const { input, flags } = args

  if (input.length < 1) await showHelp()
  if (flags.help) await showHelp()
  if (flags.version) showVersion()

  const [command, ...params] = input

  debug(`command: "${command}"`)
  debug(`params: ${JSON.stringify(params)}`)

  const urlDB = await readUrlDB()

  switch(command) {
    case 'password':
      return commands.password(urlDB, params)
    case 'user:password':
      return commands.user_password(urlDB, params)
    case 'url':
      return commands.url(urlDB, params)
    case 'dump':
      return commands.dump(urlDB, params)
    default:
      exit(`unsupported command "${command}"`)
  }
}

/** @type { () => Promise<import('./lib/types').IUrlDB> } */
async function readUrlDB() {
  const fileName = path.join(process.env.HOME, '.url-lu.toml')

  let stat
  try {
    stat = await fsp.stat(fileName)
  } catch (err) {
    exit(`error reading "${fileName}": ${err.message}`)
  }

  const { mode } = stat
  const fsc = fs.constants

  ensureNotMode(fileName, mode, fsc.S_IRGRP, 'group readable')
  ensureNotMode(fileName, mode, fsc.S_IWGRP, 'group writable')
  ensureNotMode(fileName, mode, fsc.S_IXGRP, 'group executable')
  ensureNotMode(fileName, mode, fsc.S_IROTH, 'world readable')
  ensureNotMode(fileName, mode, fsc.S_IWOTH, 'world writable')
  ensureNotMode(fileName, mode, fsc.S_IXOTH, 'world executable')

  const tomlString = await readFile(fileName)
  return UrlDB.create(fileName, tomlString)
}

/** @type { (message: string) => Promise<string> } */
async function readFile(fileName) {
  try {
    return await fsp.readFile(fileName, { encoding: 'utf8' })
  } 
  catch (err) {
    exit(`error reading "${fileName}": ${err.message}`)
  }
}

/** @type { (fileName: string, fileMode: number, checkBit: number, checkName: string) => void } */
function ensureNotMode(fileName, fileMode, checkBit, checkName) {
  if (fileMode & checkBit) {
    exit(`file "${fileName}" is ${checkName}; use 'chmod 600 "${fileName}"' to fix`)

  }
}

// returns parsed args from meow
function parseArgs () {
  const meowOptions = {
    flags: {
      help: { type: 'boolean', alias: 'v' },
      version: { type: 'boolean', alias: 'v' },
    }
  }

  // @ts-ignore
  return meow(meowOptions)
}

async function showHelp () {
  const help = await readFile(path.join(__dirname, 'README.md'))
  console.error(help)
  process.exit(1)
}

function showVersion () {
  console.error(program.version)
  process.exit(1)
}
