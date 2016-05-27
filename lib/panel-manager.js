'use strict'

const events = require('sdk/event/core')
const { storage } = require('sdk/simple-storage')
const { prefs } = require('sdk/simple-prefs')
const { Panel } = require('sdk/panel')
const { ToggleButton } = require('sdk/ui/button/toggle')

let _panel = null
let _button = null

module.exports = {
  init: function () {
    _panel = new Panel({
      contentURL: './panel/panel.html',
      contentScriptFile: './panel/panel.js',
      onHide: () => _button.state('window', { checked: false })
    })

    _button = new ToggleButton({
      id: 'dustman-button',
      label: 'Recently auto-closed tabs',
      icon: './icon.svg',
      onChange: (state) => state.checked && _panel.show({ position: _button })
    })

    _panel.port.on('pause-clicked', () => this.emit('pause-action'))
    _panel.port.on('resume-clicked', () => this.emit('resume-action'))
    _panel.port.on('link-added', tab => this.addToHistory(tab))
    _panel.port.on('link-removed', tab => this.removeFromHistory(tab))

    const history = (storage.tabs || []).slice(-1 * prefs.maxHistorySize)
    storage.tabs = []
    history.forEach(tab => this.addLink(tab))
  },

  addLink: function (tab) {
    _panel.port.emit('add-link', tab)
  },

  removeLink: function (tab) {
    _panel.port.emit('remove-link', tab)
  },

  addToHistory: function (tab) {
    storage.tabs.push(tab)

    if (storage.tabs.length > prefs.maxHistorySize) {
      const excess = storage.tabs.length - prefs.maxHistorySize
      const extraTabs = storage.tabs.splice(0, excess)
      extraTabs.forEach(tab => this.removeLink(tab))
    }
  },

  removeFromHistory: function (tab) {
    for (let i = 0; i < storage.tabs.length; ++i) {
      if (storage.tabs[i].url === tab.url) {
        storage.tabs.splice(i, 1)
      }
    }
  },

  on: function (...args) {
    events.on(this, ...args)
  },

  emit: function (...args) {
    events.emit(this, ...args)
  }
}
