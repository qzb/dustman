let self = require('sdk/self');
let { Panel } = require('sdk/panel');
var { ToggleButton } = require('sdk/ui/button/toggle');
let TabsManager = require('./TabsManager');

var panel, button;

function handleChange(state) {
    if (state.checked) {
        panel.show({ position: button });
    }
}

function handleHide() {
    button.state('window', { checked: false });
}

panel = new Panel({
    contentURL: self.data.url('panel.html'),
    contentScriptFile: self.data.url('panel.js'),
    onHide: handleHide
});

button = new ToggleButton({
    id: 'dustyman-button',
    label: 'Recently auto-closed tabs',
    icon: {
        '16': './icon-16.png',
        '18': './icon-18.png',
        '32': './icon-32.png',
        '64': './icon-64.png'
    },
    onChange: handleChange
});

TabsManager.on('tab-close', tab => panel.port.emit('tab-close', tab));
TabsManager.init();

panel.port.on('pause', TabsManager.pause);
panel.port.on('resume', TabsManager.resume);
