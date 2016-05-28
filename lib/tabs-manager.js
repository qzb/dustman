'use strict'

const tabs = require('sdk/tabs')
const windows = require('sdk/windows')
const event = require('sdk/event/core')
const { prefs } = require('sdk/simple-prefs')
const { setInterval } = require('sdk/timers')
const { getFavicon } = require('sdk/places/favicon')
const observer = require('./observer')

const _lastActivity = new WeakMap()
let _paused = false

module.exports = {
  init: function () {
    for (let tab of tabs) {
      _lastActivity.set(tab, Date.now())
    }

    tabs.on('open', tab => {
      _lastActivity.set(tab, Date.now())
    })

    tabs.on('activate', tab => {
      _lastActivity.set(tab, Date.now())
    })

    tabs.on('deactivate', tab => {
      _lastActivity.set(tab, Date.now())
    })

    observer.on('user-activity', () => {
      _lastActivity.set(tabs.activeTab, Date.now())
    })

    setInterval(() => this.update(), 10000)
  },

  on: function (...args) {
    event.on(this, ...args)
  },

  pause: function () {
    _paused = true
  },

  resume: function () {
    _paused = false
  },

  reset: function () {
    for (let tab of tabs) {
      _lastActivity.set(tab, Date.now())
    }
  },

  update: function () {
    for (let window of windows.browserWindows) {
      const windowTabs = Array.from(window.tabs)
      const pinnedTabsCount = windowTabs.filter(tab => tab.isPinned).length
      const maxTabsToClose = Math.max(0, windowTabs.length - pinnedTabsCount - prefs.minTabsCount)
      const activityThreshold = Date.now() - (prefs.maxInactivityTime * 60 * 1000)

      if (_paused || maxTabsToClose === 0) {
        continue
      }

      const tabsToClose = Array.from(windowTabs)
        .filter(tab => _lastActivity.get(tab) < activityThreshold && !tab.isPinned)
        .sort((tabA, tabB) => _lastActivity.get(tabA) - _lastActivity.get(tabB))
        .slice(0, maxTabsToClose)

      for (let tab of tabsToClose) {
        const { url, title } = tab

        getFavicon(url, favicon => {
          tab.close(() => {
            event.emit(this, 'tab-closed', { url, title, favicon })
          })
        })
      }
    }
  }
}
