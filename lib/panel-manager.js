'use strict';

let self = require('sdk/self');
let events = require('sdk/event/core');
let { storage } = require('sdk/simple-storage');
let { prefs } = require('sdk/simple-prefs');
let { Panel } = require('sdk/panel');
let { ToggleButton } = require('sdk/ui/button/toggle');

let _panel = null;
let _button = null;

var PanelManager = {
    init: function () {
        _panel = new Panel({
            contentURL: './panel.html',
            contentScriptFile: './panel.js',
            onHide: () => _button.state('window', { checked: false }),
        });

        _button = new ToggleButton({
            id: 'dustman-button',
            label: 'Recently auto-closed tabs',
            icon: './icon.svg',
            onChange: (state) => state.checked && _panel.show({ position: _button }),
        });

        _panel.port.on('pause-clicked',  () => this.emit('pause-action'));
        _panel.port.on('resume-clicked', () => this.emit('resume-action'));
        _panel.port.on('link-added',     tab => this.addToHistory(tab));
        _panel.port.on('link-removed',   tab => this.removeFromHistory(tab));

        let history = (storage.tabs || []).slice(-1 * prefs.maxHistorySize);
        storage.tabs = [];
        history.forEach(tab => this.addLink(tab));
    },

    addLink: function (tab) {
        _panel.port.emit('add-link', tab);
    },

    removeLink: function (tab) {
        _panel.port.emit('remove-link', tab);
    },

    addToHistory: function (tab) {
        storage.tabs.push(tab);

        if (storage.tabs.length > prefs.maxHistorySize) {
             let excess = storage.tabs.length - prefs.maxHistorySize;
             let extraTabs = storage.tabs.splice(0, excess);
             extraTabs.forEach(tab => this.removeLink(tab));
        }
    },

    removeFromHistory: function (tab) {
        for (let i=0; i<storage.tabs.length; ++i) {
            if (storage.tabs[i].url === tab.url) {
                storage.tabs.splice(i, 1);
            }
        }
    }
};

PanelManager.on = events.on.bind(null, PanelManager);
PanelManager.once = events.once.bind(null, PanelManager);
PanelManager.off = events.off.bind(null, PanelManager);
PanelManager.emit = events.emit.bind(null, PanelManager);

module.exports = PanelManager;
