'use strict'

initialState().then(state => {
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
    for (const key in changes) {
      state[key] = changes[key].newValue
    }
    autoclose(state)

    updateBrowserAction(state)
    if (state.settings.saveClosedPages === false) {
      state.closedPages = []
    }
  })

  return autoclose(state)
})
