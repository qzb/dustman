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
    browser.browserAction.setBadgeText({text: browser.i18n.getMessage('buttonBadgePaused')}) //🚫'})
    browser.browserAction.setBadgeBackgroundColor({color: [0, 0, 0, 0]})
    browser.browserAction.setTitle({title: browser.i18n.getMessage('buttonTooltipPaused')})
  } else {
    browser.browserAction.setBadgeText({text: ''})
    browser.browserAction.setTitle({title: browser.i18n.getMessage('buttonTooltip')})
  }

  if (state.settings.maxHistorySize > 0) {
    browser.browserAction.setPopup(
      {popup: browser.extension.getURL(browser.runtime.getManifest().browser_action.default_popup)}
    )
  } else {
    browser.browserAction.setPopup({popup: ''})
  }
}
