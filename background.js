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
    state.lastAccessed.set(tab.id, new Date().getTime())
    autoclose(state)
  })
  browser.tabs.onAttached.addListener(() => autoclose(state))
  browser.tabs.onUpdated.addListener(changeInfo => {
    if (changeInfo.pinned === false || changeInfo.audible === false) {
      autoclose(state)
    }
  })
  browser.tabs.onActivated.addListener(({tabId, windowId}) => {
    const now = new Date().getTime()
    const lastTabId = state.activeTabs.get(windowId)
    if (lastTabId) {
      state.lastAccessed.set(lastTabId, now)
    }
    state.lastAccessed.set(tabId, now)
    state.activeTabs.set(windowId, tabId)
  })
  browser.tabs.onRemoved.addListener(tabId => {
    state.lastAccessed.delete(tabId)
  })
  browser.windows.onRemoved.addListener(windowId => {
    state.activeTabs.delete(windowId)
  })
  browser.tabs.query({windowType: 'normal'}).then(tabs => {
    const now = new Date().getTime()
    for (const tab of tabs) {
      state.lastAccessed.set(tab.id, now)
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
