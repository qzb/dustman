let TabsManager = require('./tabs-manager');
let PanelManager = require('./panel-manager');

PanelManager.on('pause-action',  () => TabsManager.pause());
PanelManager.on('resume-action', () => TabsManager.resume());
PanelManager.init();

TabsManager.on('tab-closed', tab => PanelManager.addLink(tab));
TabsManager.init();
