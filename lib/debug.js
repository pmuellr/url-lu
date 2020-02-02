'use strict'

module.exports = {
  debug
}

const program = require('./program')

/** @type { (message: string) => void } */
function debug(message) {
  if (!process.env.DEBUG) return
  console.error(`[DEBUG] ${program.name}: ${message}`)
}