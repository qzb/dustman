'use strict';

const tabs = require('sdk/tabs');
const windows = require('sdk/windows');
const events = require('sdk/event/core');
const { prefs } = require('sdk/simple-prefs');
const { setInterval } = require('sdk/timers');
const { getFavicon } = require('sdk/places/favicon');

let _paused = false;
let _lastActivity = {};
let _updateInterval = null;

let TabsManager = {
    init: function () {
        for (let tab of tabs) {
            _lastActivity[tab.id] = Date.now();
        }

        tabs.on('open', tab => _lastActivity[tab.id] = Date.now());
        tabs.on('activate', tab => _lastActivity[tab.id] = Date.now());
        tabs.on('deactivate', tab => _lastActivity[tab.id] = Date.now());
        tabs.on('close', tab => delete _lastActivity[tab.id]);

        _updateInterval = setInterval(() => this.update(), 10000);
    },

    update: function () {
        for (let window of windows.browserWindows) {
            let windowTabs = Array.from(window.tabs);
            let pinnedTabsCount = windowTabs.filter(t => t.isPinned).length;
            let maxTabsToClose = Math.max(0, windowTabs.length - pinnedTabsCount - prefs.minTabsCount);
            let activityThreshold = Date.now() - (prefs.maxInactivityTime * 60 * 1000);

            if (_paused || maxTabsToClose === 0) {
                continue;
            }

            let tabsToClose = Array.from(windowTabs)
                .filter(tab => _lastActivity[tab.id] < activityThreshold && !tab.isPinned && tab !== tabs.activeTab)
                .sort((tabA, tabB) => _lastActivity[tabA.id] - _lastActivity[tabB.id])
                .slice(0, maxTabsToClose);

            for (let tab of tabsToClose) {
                let { url, title } = tab;

                getFavicon(url, favicon => {
                    tab.close(() => this.emit('tab-closed', { url, title, favicon }));
                });
            }
        }
    },

    pause: function () {
        _paused = true;
    },

    resume: function () {
        _paused = false;
        Object.keys(_lastActivity).forEach(id => _lastActivity[id] = Date.now());
    }
};

TabsManager.on = events.on.bind(null, TabsManager);
TabsManager.once = events.once.bind(null, TabsManager);
TabsManager.off = events.off.bind(null, TabsManager);
TabsManager.emit = events.emit.bind(null, TabsManager);

module.exports = TabsManager;
