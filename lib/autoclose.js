'use strict'

/**
 * @typedef TabInfo
 * @type {object}
 * @property {integer} tabId
 * @property {integer} windowId
 * @property {number} inactiveMilliseconds - milliseconds since last activity in the tab
 * @property {boolean} pinned - whether the tab is pinned
 * @property {boolean} seen - whether the tab has been seen by the user at least once
 */

/**
 * @typedef CloseInfo
 * @type {object}
 * @property {Array.<integer>} tabIds
 * @property {number} millisecondsUntilNextCheck - potentially Infinity if no tab can be closed at some point in the future
 */

/**
 * Get a list of tabs that should be closed, as well as the time when another
 * tab can be closed (if any).
 * @param {number} now - milliseconds since the epoch
 * @param {Settings} settings
 * @param {Array.<browser.tabs.Tab>} tabs
 * @return {CloseInfo}
 */
function tabsToClose (now, settings, tabs) {
  const windowIds = Array.from(new Set(tabs.map(tab => tab.windowId)))
  const tabsByWindow = windowIds.map(windowId => tabs.filter(tab => tab.windowId === windowId))

  const perWindowResults = tabsByWindow.map(tabs => {
    const unpinnedTabs = tabs.filter(tab => !tab.pinned)
    const numTabsToClose = unpinnedTabs.length - settings.minTabsCount
    if (numTabsToClose <= 0) {
      return {tabsToClose: [], nextCheck: Infinity}
    }

    // closeable tabs (now or in the future), sorted from longest to shortest inactivity
    const closeableTabs =
      unpinnedTabs.filter(tab => tab.audible === false && tab.lastAccessed < Infinity)
      .sort((t1, t2) => t1.lastAccessed > t2.lastAccessed)

    const nowCloseableTabs =
      closeableTabs.filter(tab => tab.lastAccessed + settings.minInactiveMilliseconds < now)
    const onlyLaterCloseableTabs =
      closeableTabs.filter(tab => tab.lastAccessed + settings.minInactiveMilliseconds >= now)

    const tabsToClose = nowCloseableTabs.slice(0, numTabsToClose)
    var nextCheck
    if (tabsToClose.length === numTabsToClose || onlyLaterCloseableTabs.length === 0) {
      nextCheck = Infinity
    } else {
      nextCheck = onlyLaterCloseableTabs[0].lastAccessed + settings.minInactiveMilliseconds
    }

    return {tabsToClose, nextCheck}
  })

  const tabsToClose =
    Array.prototype.concat.apply([], perWindowResults.map(res => res.tabsToClose))

  const nextCheck =
    Math.min.apply(null, perWindowResults.map(res => res.nextCheck))

  return {tabsToClose, nextCheck}
}

/**
 * Whether a tab can be saved to the panel.
 * @param {browser.tabs.Tab} tab
 * @return {boolean}
 */
function saveableTab (tab) {
  if (tab.title == null || tab.url == null) {
    return false
  }

  const protocol = new URL(tab.url).protocol
  if (['chrome:', 'javascript:', 'data:', 'file:', 'about:'].indexOf(protocol) >= 0) {
    return false
  }

  if (tab.incognito === true) {
    return false
  }

  return true
}

/**
 * Auto-close old tabs. Also clears the timeout and sets a new one for the next
 * auto-close if appropriate.
 * @param {State} state
 * @return {Promise.<()>}
 */
function autoclose (state) {
  clearTimeout(state.autocloseTimeoutId)

  if (state.paused) {
    return Promise.resolve()
  }

  return browser.tabs.query({windowType: 'normal'}).then(tabs => {
    const now = new Date().getTime()
    const {tabsToClose: tabsToClose_, nextCheck} = tabsToClose(now, state.settings, tabs)

    if (nextCheck < Infinity) {
      // check again at nextCheck + some tolerance
      state.autocloseTimeoutId = setTimeout(() => autoclose(state), nextCheck - now + 1000)
    }

    return browser.tabs.remove(tabsToClose_.map(tab => tab.id)).then(() => {
      console.log('closed', state)
      if (state.settings.maxHistorySize > 0) {
        const history =
          tabsToClose_
            .filter(saveableTab)
            .map(tab => ({title: tab.title, url: tab.url, favIconUrl: tab.favIconUrl}))
        console.log('history', history)
        console.log('tabsToClose_', tabsToClose_)
        state.history =
          history.concat(state.history).slice(0, state.settings.maxHistorySize)
        console.log('saved', state)
        if (state.settings.clearHistoryOnExit === false) {
          console.log('serialized')
          return persistHistory(state)
        }
      }
    })
  })
}
