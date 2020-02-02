'use strict'

module.exports = {
  exit
}

const program = require('./program')

/** @type { (message: string) => void } */
function exit(message) {
  console.error(`${program.name}: ${message}`)
  process.exit(1)
}