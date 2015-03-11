let tabs = require('sdk/tabs');
let events = require('sdk/event/core');
let { prefs } = require('sdk/simple-prefs');
let { setInterval } = require('sdk/timers');
let { getFavicon } = require("sdk/places/favicon");

let lastActivity = {};
let updateInterval = null;

let TabsManager = {
    init: function () {
        for (let tab of tabs) {
            lastActivity[tab.id] = Date.now();
        }

        tabs.on('open', tab => lastActivity[tab.id] = Date.now());
        tabs.on('activate', tab => lastActivity[tab.id] = Date.now());
        tabs.on('close', tab => delete lastActivity[tab.id]);

        updateInterval = setInterval(TabsManager.update, 10000);
    },


    update: function () {
        let pinnedTabsCount = Array.prototype.slice.call(tabs).filter(t => t.isPinned).length;
        let minTabsCount = prefs.minTabsCount + pinnedTabsCount;
        let maxAge = prefs.maxInactivityTime * 60 * 1000;

        if (tabs.length - pinnedTabsCount <= prefs.minTabsCount) {
            return;
        }

        for (let tab of tabs) {
            let tabAge = Date.now() - lastActivity[tab.id];

            if (tabs.length > minTabsCount && tabAge > maxAge && !tab.isPinned) {
                let url = tab.url;
                let title = tab.title;
                getFavicon(url, favicon => TabsManager.emit('tab-close', { url, title, favicon: favicon || tab.favicon }));
                tab.close();
            }
        }
    }
};

TabsManager.on = events.on.bind(null, TabsManager);
TabsManager.once = events.once.bind(null, TabsManager);
TabsManager.off = events.off.bind(null, TabsManager);
TabsManager.emit = events.emit.bind(null, TabsManager);

module.exports = TabsManager;
