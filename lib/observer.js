'use strict'

const event = require('sdk/event/core')
const pageMod = require('sdk/page-mod')

const observer = {}

pageMod.PageMod({
  include: '*',
  attachTo: [ 'existing', 'top' ],
  contentScriptFile: './observer.js',
  onAttach: worker => {
    worker.port.on('event', event.emit.bind(null, observer))
  }
})

module.exports = observer
module.exports.on = event.on.bind(null, observer)
