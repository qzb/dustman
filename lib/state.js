'use strict'

/**
 * @typedef Settings
 * @type {object}
 * @property {number} maxInactiveMilliseconds
 * @property {integer} minTabsCount
 * @property {boolean} saveClosedPages
 */

const defaultSettings = {
  minInactiveMilliseconds: 10 * 60 * 1000, // 10 minutes
  minTabsCount: 7,
  saveClosedPages: false
}

/**
 * @typedef ClosedPageInfo
 * @type {object}
 * @property {String} url
 * @property {String} title
 * @property {String} favIconUrl
 */

/**
 * @typedef State
 * @type {object}
 * @property {Settings} settings
 * @property {integer} autocloseTimeoutId
 * @property {boolean} paused
 * @property {Array.<ClosedPageInfo>} closedPages
 * @property {Map.<integer, number>} lastAccessed - maps tab ids to their last access timestamp
 * @property {Map.<integer, integer>} activeTabs - maps window ids to the id of the active tab in their respective windows
 */

/**
 * Load the settings from storage if possible, and otherwise get the default settings
 * @return {Promise.<Settings>}
 */
function loadSettings () {
  return browser.storage.local.get('settings').then(
    s => s.settings || defaultSettings,
    err => {
      console.log(err)
      return defaultSettings
    }
  )
}

/**
 * Save settings to storage.
 * @return {Promise.<()>}
 */
function saveSettings (s) {
  return browser.storage.local.set({settings: s})
}

/**
 * Load the initial state at app start.
 * @return {Promise.<State>}
 */
function initialState () {
  return loadSettings().then(settings => ({
    settings: settings,
    autocloseTimeoutId: 0,
    paused: false,
    closedPages: [],
    lastAccessed: new Map(),
    activeTabs: new Map()
  }))
}
