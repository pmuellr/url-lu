'use strict'

// @ts-ignore
const pkg = require('../package.json')

const { name, version, homepage, description } = pkg

/** @type {{ name: string, version: string, homepage: string, description: string }} */
module.exports = { name, version, homepage, description }
