let tabs = require('sdk/tabs');
let { setInterval } = require('sdk/timers');

let MIN_COUNT = 5;
let MAX_AGE = 20*60*1000;

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

        if (tabs.length - pinnedTabsCount <= MIN_COUNT) {
            return;
        }

        for (let tab of tabs) {
            let tabAge = Date.now() - lastActivity[tab.id];
            let tabsCount = tabs.length - pinnedTabsCount;
            if (tabsCount > MIN_COUNT && tabAge > MAX_AGE && !tab.isPinned) {
                tab.close();
            }
        }
    }
};

TabsManager.init();
