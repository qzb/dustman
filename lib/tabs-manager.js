let tabs = require('sdk/tabs');
let events = require('sdk/event/core');
let { prefs } = require('sdk/simple-prefs');
let { setInterval } = require('sdk/timers');
let { getFavicon } = require("sdk/places/favicon");

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
        let minTabsCount = prefs.minTabsCount + pinnedTabsCount;
        let maxAge = prefs.maxInactivityTime * 60 * 1000;

        if (_paused) {
            return;
        }

        if (tabs.length - pinnedTabsCount <= prefs.minTabsCount) {
            return;
        }

        for (let tab of tabs) {
            let tabAge = Date.now() - _lastActivity[tab.id];

            if (tabs.length > minTabsCount && tabAge > maxAge && !tab.isPinned) {
                let url = tab.url;
                let title = tab.title;
                getFavicon(url, fav => this.emit('tab-closed', { url, title, favicon: fav || tab.favicon }));
                tab.close();
            }
        }
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
