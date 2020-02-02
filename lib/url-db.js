'use strict'

module.exports = {
  create,
}

const toml = require('toml')

const { exit } = require('./error')

/** @typedef { import("./types").IUrlDB } IUrlDB */
/** @typedef { import("./types").IGroup } IGroup */

/** @type { (fileName: string, tomlString: string) => IUrlDB } */
function create(fileName, tomlString) {
  return new UrlDB(fileName, tomlString)
}

class UrlDB {
  /**
  * @constructor
  * @param {string} fileName
  * @param {string} tomlString
  */  
  constructor(fileName, tomlString) {
    this.map = populateMapFromToml(fileName, tomlString)
  }

  /** @type { () => string } */
  dump() {
    const result = []
    for (const groupName of this.map.keys()) {
      const group = this.map.get(groupName)
      result.push(`group ${groupName}`)

      const urlNameLengths = group.getUrlNames().map(urlName => urlName.length)
      const maxUrlNameLength = Math.max(...urlNameLengths)
      
      result.push(`    urls`)
      for (const urlName of group.getUrlNames()) {
        result.push(`        ${urlName.padEnd(maxUrlNameLength)} ${group.getUrl(urlName)}`)
      }
  
      result.push(`    users`)
      for (const user of group.getUsers()) {
        result.push(`        ${user}`)
      }
  
      result.push('')
    }

    return result.join('\n')
  }

  /** @type { (groupName: string, urlName: string) => string } */
  getUrl(groupName, urlName) {
    const group = this.map.get(groupName)
    if (!group) exit(`group not found: ${groupName}`)

    return group.getUrl(urlName)
  }

  /** @type { (groupName: string, user: string) => string } */
  getPassword(groupName, user) {
    const group = this.map.get(groupName)
    if (!group) exit(`group not found: ${groupName}`)

    return group.getPassword(user)
  }
}

class Group {
  /**
  * @constructor
  * @param {string}              groupName
  * @param {Map<string, string>} urls
  * @param {Map<string, string>} passwords
  */  
  constructor(groupName, urls, passwords) {
    this.groupName = groupName
    this.urls = urls
    this.passwords = passwords
  }
  
  /** @type { () => string[] } */
  getUrlNames() {
    return Array.from(this.urls.keys())
  }

  /** @type { () => string[] } */
  getUsers() {
    return Array.from(this.passwords.keys())
  }

  /** @type { (name: string) => string } */
  getUrl(name) {
    const value = this.urls.get(name)
    if (!value) exit(`group "${this.groupName}" has no url ${name}`)
    return value
  }

  /** @type { (name: string) => string } */
  getPassword(user) {
    const value = this.passwords.get(user)
    if (!value) exit(`group "${this.groupName}" has no user ${user}`)
    return value
  }
}

/** @type { (fileName: string, tomlString: string) => Map<string, IGroup> } */
function populateMapFromToml(fileName, tomlString) {
  let object
  try {
    object = toml.parse(tomlString)
  } catch (err) {
    exit(`error parsing toml content from "${fileName}": ${err.message}`)
  }

  /** @type { Map<string, IGroup> } */
  const result = new Map()

  for (const groupName of Object.keys(object)) {
    const groupObject = object[groupName]
    validateGroupProperties(groupObject)

    /** @type { Map<string, string> } */
    const urlMap = new Map()
    /** @type { Map<string, string> } */
    const passwordMap = new Map()

    const group = new Group(groupName, urlMap, passwordMap)
    result.set(groupName, group)

    for (const [name, url] of Object.entries(groupObject.urls)) {
      urlMap.set(name, `${url}`)
    }

    for (const [user, password] of Object.entries(groupObject.passwords)) {
      passwordMap.set(user, `${password}`)
    }
  }

  return result
}

/** @type { (group: Record<string, any>) => void } */
function validateGroupProperties(group) {
  validateGroupProperty(group, 'urls')
  validateGroupProperty(group, 'passwords')
}

/** @type { (group: Record<string, any>, prop: string) => void } */
function validateGroupProperty(group, propName) {
  const propValue = group[propName]
  if (propValue == null) {
    exit(`group "${group}" does not have a "${propName}" property`)
  }

  if (Array.isArray(propValue) || typeof propValue !== 'object') {
    exit(`group "${group}" property "${propName}' is not an object`)
  }
}