'use strict'

// get the background page
const bp = browser.extension.getBackgroundPage()

/**
 * Create a link node from a closed page info
 * @param {ClosedPageInfo}
 * @return {HTMLElement}
 */
function makeLink ({url, title, favIconUrl}) {
  const link = document.createElement('a')
  link.setAttribute('href', url)

  const img = document.createElement('img')
  img.setAttribute('height', '1em')
  img.setAttribute('width', '1em')
  img.setAttribute('src', favIconUrl || 'default-favicon.png')
  link.appendChild(img)

  const titleNode = document.createTextNode(title)
  link.appendChild(titleNode)

  return link
}
/**
 * Populate the list of closed pages.
 * @param {State} state
 */
function populateLinkList (state) {
  const linkList = document.getElementById('link-list')

  while (linkList.hasChildNodes()) {
    linkList.removeChild(linkList.lastChild)
  }

  for (let closedPage of state.history) {
    const link = makeLink(closedPage)
    link.addEventListener('click', event => {
      const i = state.history.indexOf(closedPage)
      state.history.splice(i, 1)
      if (state.settings.clearHistoryOnExit === false) {
        persistHistory(state)
      }
      linkList.removeChild(link)
    })
    linkList.appendChild(link)
  }
}

/**
 * Set up actions for the pause toggle button.
 * @param {State} state
 */
function initializePauseButton (state) {
  const button = document.getElementById('pause-toggle-button')
  if (state.paused) {
    button.classList.add('paused')
  } else {
    button.classList.remove('paused')
  }

  button.addEventListener('click', () => {
    state.paused = !state.paused
    bp.updateBrowserAction(state)
    bp.autoclose(state).then(() => {
      populateLinkList(state)
      if (state.paused) {
        button.classList.add('paused')
      } else {
        button.classList.remove('paused')
      }
    })
  })
}

populateLinkList(bp.state)
initializePauseButton(bp.state)
