'use strict'

const tabs = require('sdk/tabs')
const windows = require('sdk/windows')
const events = require('sdk/event/core')
const { prefs } = require('sdk/simple-prefs')
const { setInterval } = require('sdk/timers')
const { getFavicon } = require('sdk/places/favicon')
const observer = require('./observer')

const _lastActivity = {}
let _paused = false

module.exports = {
  init: function () {
    for (let tab of tabs) {
      _lastActivity[tab.id] = Date.now()
    }

    tabs.on('open', tab => {
      _lastActivity[tab.id] = Date.now()
    })

    tabs.on('activate', tab => {
      _lastActivity[tab.id] = Date.now()
    })

    tabs.on('deactivate', tab => {
      _lastActivity[tab.id] = Date.now()
    })

    tabs.on('close', tab => {
      delete _lastActivity[tab.id]
    })

    observer.on('user-activity', () => {
      _lastActivity[tabs.activeTab] = Date.now()
    })

    setInterval(() => this.update(), 10000)
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
        .filter(tab => _lastActivity[tab.id] < activityThreshold && !tab.isPinned)
        .sort((tabA, tabB) => _lastActivity[tabA.id] - _lastActivity[tabB.id])
        .slice(0, maxTabsToClose)

      for (let tab of tabsToClose) {
        const { url, title } = tab

        getFavicon(url, favicon => {
          tab.close(() => this.emit('tab-closed', { url, title, favicon }))
        })
      }
    }
  },

  pause: function () {
    _paused = true
  },

  resume: function () {
    _paused = false
  },

  reset: function () {
    for (let id of Object.keys(_lastActivity)) {
      _lastActivity[id] = Date.now()
    }
  },

  on: function (...args) {
    events.on(this, ...args)
  },

  emit: function (...args) {
    events.emit(this, ...args)
  }
}
