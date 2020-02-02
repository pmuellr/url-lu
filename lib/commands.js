'use strict'

module.exports = {
  password,
  user_password,
  url,
  dump,
}

const { URL } = require('url')
const { exit } = require('./error')

/** @typedef { import("./types").IUrlDB } IUrlDB */

/** @type { (urlDB: IUrlDB, params: string[]) => void } */
function password(urlDB, params) {
  const [ group, user ] = params
  if (!group) exit('group name parameter is required')
  if (!user) exit('user parameter is required')

  const password = urlDB.getPassword(group, user)
  console.log(password)
}

/** @type { (urlDB: IUrlDB, params: string[]) => void } */
function user_password(urlDB, params) {
  const [ group, user ] = params
  if (!group) exit('group name parameter is required')
  if (!user) exit('user parameter is required')

  const password = urlDB.getPassword(group, user)
  console.log(`${user}:${password}`)
}

/** @type { (urlDB: IUrlDB, params: string[]) => void } */
function url(urlDB, params) {
  const [ group, urlName, user ] = params
  if (!group) exit('group name parameter is required')
  if (!urlName) exit('urlName parameter is required')

  const url = urlDB.getUrl(group, urlName)

  let urlObject

  try {
    urlObject = new URL(url)
  } catch (err) {
    exit(`unable to parse url "${url}": ${err.message}`)
  }

  if (!user) {
    console.log(`${urlObject}`)
    return
  }

  urlObject.username = user
  urlObject.password = urlDB.getPassword(group, user)

  console.log(`${urlObject}`)
}

/** @type { (urlDB: IUrlDB, params: string[]) => void } */
function dump(urlDB, params) {
  console.log(urlDB.dump())
}
