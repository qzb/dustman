'use strict';

const events = require('sdk/event/core');
const pageMod = require('sdk/page-mod');

module.exports = {
    init: function () {
        pageMod.PageMod({
            include: '*',
            attachTo: [ 'existing', 'top' ],
            contentScript: `
                if (document.fullscreenElement !== undefined) {
                    document.addEventListener('fullscreenchange', () => {
                        self.port.emit('fullscreenchange', !!document.fullscreenElement);
                    });
                } else {
                    document.addEventListener('mozfullscreenchange', () => {
                        self.port.emit('fullscreenchange', !!document.mozFullScreenElement);
                    });
                }
            `,
            onAttach: worker => {
                worker.port.on('fullscreenchange', enabled => {
                    if (enabled) {
                        this.emit('enabled');
                    } else {
                        this.emit('disabled');
                    }
                });
            }
        });
    },

    on: function (...args) {
        events.on(this, ...args);
    },

    emit: function (...args) {
        events.emit(this, ...args);
    }
};
