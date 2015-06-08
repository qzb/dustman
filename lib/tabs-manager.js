let tabs = require('sdk/tabs');
let events = require('sdk/event/core');
let { prefs } = require('sdk/simple-prefs');
let { setInterval } = require('sdk/timers');
let { getFavicon } = require('sdk/places/favicon');

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
        let pinnedTabsCount = Array.prototype.slice.call(tabs).filter(t => t.isPinned).length;
        let maxTabsToClose = Math.max(0, tabs.length - pinnedTabsCount - prefs.minTabsCount);
        let activityThreshold = Date.now() - (prefs.maxInactivityTime * 60 * 1000);

        if (_paused || maxTabsToClose === 0) {
            return;
        }

        let toClose = Array.from(tabs)
            .filter(tab => _lastActivity[tab.id] < activityThreshold && !tab.isPinned)
            .sort((tabA, tabB) => _lastActivity[tabA.id] - _lastActivity[tabB.id])
            .slice(0, maxTabsToClose);

        toClose.forEach(tab => {
            let url = tab.url;
            let title = tab.title;

            getFavicon(tab.url, favicon => {
                tab.close(() => this.emit('tab-closed', { url, title, favicon }));
            });
        });
    },

    pause: function () {
        _paused = true;
    },

    resume: function () {
        _paused = false;
        Object.keys(_lastActivity).forEach(id => _lastActivity[id] = Date.now());
    },
};

TabsManager.on = events.on.bind(null, TabsManager);
TabsManager.once = events.once.bind(null, TabsManager);
TabsManager.off = events.off.bind(null, TabsManager);
TabsManager.emit = events.emit.bind(null, TabsManager);

module.exports = TabsManager;
