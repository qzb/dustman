'use strict'

/**
 * @typedef Settings
 * @type {object}
 * @property {number} maxInactiveMilliseconds
 * @property {integer} minTabsCount
 * @property {integer} maxHistorySize
 * @property {boolean} clearHistoryOnExit
 */

const defaultSettings = {
  minInactiveMilliseconds: 20 * 60 * 1000,
  minTabsCount: 5,
  maxHistorySize: 1000,
  clearHistoryOnExit: true
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
 * @property {Array.<ClosedPageInfo>} history
 */

/**
 * Load the persistent state from storage if possible, and otherwise set
 * everything to defaults
 * @return {Promise.<PersistentState>}
 */
function loadState () {
  return browser.storage.local.get().then(state => state, err => {
    console.log(err)
    return {settings: defaultSettings}
  }).then(state => {
    if (state.settings == null) {
      state.settings = defaultSettings
    }
    if (state.history == null) {
      state.history = []
    }
    state.autocloseTimeoutId = 0
    state.paused = false

    // handle settings from previous versions of dustman
    const settings = state.settings

    if (settings.saveClosedPages != null) {
      if (settings.saveClosedPages=== true) {
        settings.maxHistorySize = defaultSettings.maxHistorySize
      } else {
        settings.maxHistorySize = 0
      }
      delete settings.saveClosedPages
    }

    if (settings.clearHistoryOnExit == null) {
      settings.clearHistoryOnExit = defaultSettings.clearHistoryOnExit
    }
    return state
  })
}

/**
 * Save settings to storage.
 * @param {Settings} settings
 * @return {Promise.<()>}
 */
function persistSettings (settings) {
  return browser.storage.local.set({settings: settings})
}

/**
 * Save history to disk, or delete history on disk (depending on settings).
 * @param {State} state
 * @return {Promise.<()>}
 */
function persistHistory (state) {
  if (state.settings.clearHistoryOnExit === false) {
    return browser.storage.local.set({history: state.history})
  } else {
    return browser.storage.local.remove('history')
  }
}
