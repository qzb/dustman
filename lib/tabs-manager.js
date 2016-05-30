'use strict'

const tabs = require('sdk/tabs')
const windows = require('sdk/windows')
const event = require('sdk/event/core')
const { prefs } = require('sdk/simple-prefs')
const { setInterval } = require('sdk/timers')
const { getFavicon } = require('sdk/places/favicon')
const observer = require('./observer')

const _lastActivity = new WeakMap()
let _updateInterval = null

module.exports = {
  init: function () {
    for (let tab of tabs) {
      _lastActivity.set(tab, Date.now())
    }

    tabs.on('open', tab => {
      if (!prefs.lockUnseenTabs || tabs.activeTab.url === 'about:sessionrestore') {
        _lastActivity.set(tab, Date.now())
      }
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

    this.resume()
  },

  on: function (...args) {
    event.on(this, ...args)
  },

  pause: function () {
    clearInterval(_updateInterval)
  },

  resume: function () {
    _updateInterval = setInterval(this.update.bind(this), 5000)
  },

  reset: function () {
    for (let tab of tabs) {
      _lastActivity.set(tab, Date.now())
    }
  },

  update: function () {
    for (let window of windows.browserWindows) {
      const allTabs = Array.from(window.tabs)
      const pinnedTabs = allTabs.filter(tab => tab.isPinned)
      const unseenTabs = allTabs.filter(tab => !_lastActivity.has(tab) && !tab.isPinned)
      const maxTabsToClose = Math.max(0, allTabs.length - pinnedTabs.length - unseenTabs.length - prefs.minTabsCount)
      const activityThreshold = Date.now() - (prefs.maxInactivityTime * 60 * 1000)

      const tabsToClose = Array.from(allTabs)
        .filter(tab => _lastActivity.has(tab))
        .filter(tab => _lastActivity.get(tab) < activityThreshold)
        .filter(tab => !tab.isPinned)
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
