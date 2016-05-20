'use strict';

const tabsManager = require('./tabs-manager');
const panelManager = require('./panel-manager');
const fullscreenDetector = require('./fullscreen-detector');


// Init tabs manager

tabsManager.on('tab-closed', tab => {
    panelManager.addLink(tab);
});

tabsManager.init();


// Init panel manager

panelManager.on('pause-action',  () => {
    tabsManager.pause()
});

panelManager.on('resume-action', () => {
    tabsManager.resume();
    tabsManager.reset();
});

panelManager.init();


// Pause tabs management when some document is in fullscreen mode,
// it will prevent leaving fullscreen when tab is closed.

fullscreenDetector.on('enabled',  () => {
    tabsManager.pause();
});

fullscreenDetector.on('disabled', () => {
    tabsManager.resume();
    tabsManager.update();
});

fullscreenDetector.init();
