let tabs = require('sdk/tabs');
let { prefs } = require('sdk/simple-prefs');
let { setInterval } = require('sdk/timers');

let lastActivity = {};
let updateInterval = null;

let TabsManager = module.exports = {
    init: function () {
        for (let tab of tabs) {
            lastActivity[tab.id] = Date.now();
        }

        tabs.on('open', tab => lastActivity[tab.id] = Date.now());
        tabs.on('activate', tab => lastActivity[tab.id] = Date.now());
        tabs.on('close', tab => delete lastActivity[tab.id]);

        updateInterval = setInterval(TabsManager.update, 30000);
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
                tab.close();
            }
        }
    }
};

TabsManager.init();
