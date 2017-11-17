'use strict'

loadState().then(state => {
  // make the state available via the window of the background page
  window.state = state

  browser.browserAction.onClicked.addListener(() => {
    state.paused = !state.paused
    updateBrowserAction(state)
    autoclose(state)
  })
  updateBrowserAction(state)

  browser.tabs.onCreated.addListener(tab => {
    autoclose(state)
  })
  browser.tabs.onAttached.addListener(() => autoclose(state))
  browser.tabs.onUpdated.addListener(changeInfo => {
    if (changeInfo.pinned === false || changeInfo.audible === false) {
      autoclose(state)
    }
  })

  browser.storage.onChanged.addListener(changes => {
    if ('settings' in changes) {
      state.settings = changes.settings.newValue

      updateBrowserAction(state)

      state.history = state.history.slice(0, state.settings.maxHistorySize)
      persistHistory(state)

      autoclose(state)
    }
  })

  return autoclose(state)
})
