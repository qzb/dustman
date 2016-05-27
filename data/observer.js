/* global self */

'use strict'

// Observe fullscreen mode changes.

{
  const prefixedMode = (document.mozFullScreenElement !== undefined)
  const fullscreenChangeEvent = (prefixedMode ? 'mozfullscreenchange' : 'fullscreenchange')
  const fullscreenElementProperty = (prefixedMode ? 'mozFullScreenElement' : 'fullscreenElement')

  document.addEventListener(fullscreenChangeEvent, () => {
    const fullscreenEnabled = !!document[fullscreenElementProperty]

    if (fullscreenEnabled) {
      self.port.emit('event', 'fullscreen-mode-on')
    } else {
      self.port.emit('event', 'fullscreen-mode-off')
    }
  })
}

// Observe user activity. It will send events every 5 seconds if there is some
// activity like mouse movements or key presses.

{
  let lastActivity = Date.now()

  setInterval(() => {
    if (Date.now() - lastActivity < 5000) {
      self.port.emit('event', 'user-activity')
    }
  }, 5000)

  document.addEventListener('click', () => {
    lastActivity = Date.now()
  })

  document.addEventListener('mousemove', () => {
    lastActivity = Date.now()
  })

  document.addEventListener('keypress', () => {
    lastActivity = Date.now()
  })

  document.addEventListener('scroll', () => {
    lastActivity = Date.now()
  })

  document.addEventListener('load', () => {
    lastActivity = Date.now()
  })
}
