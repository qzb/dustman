'use strict'

function updateBrowserAction (state) {
  if (
    browser.browserAction.setBadgeText == null ||
    browser.browserAction.setBadgeBackgroundColor == null ||
    browser.browserAction.setTitle == null ||
    browser.browserAction.setPopup == null
  ) {
    return
  }

  if (state.paused === true) {
    browser.browserAction.setBadgeText({text: '🚫'})
    browser.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]})
    browser.browserAction.setTitle({title: 'Dustman (paused)'})
  } else {
    browser.browserAction.setBadgeText({text: ''})
    browser.browserAction.setTitle({title: 'Dustman'})
  }

  if (state.settings.maxHistorySize > 0) {
    browser.browserAction.setPopup(
      {popup: browser.extension.getURL('panel/panel.html')}
    )
  } else {
    browser.browserAction.setPopup({popup: ''})
  }
}
