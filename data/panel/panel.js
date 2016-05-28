/* global self */

'use strict'

const links = {}

function removeLink ({ url }) {
  if (links[url]) {
    links[url].remove()
    delete links[url]
    self.port.emit('link-removed', { url })
  }
}

function addLink ({ url, title, favicon }) {
  if (url === 'about:blank' || url === 'about:newtab') {
    return
  }

  removeLink({ url })

  const section = document.querySelector('section.recently-closed')
  const link = document.createElement('a')

  link.innerHTML = `<img src="${favicon || 'default-favicon.png'}">${title}`
  link.onclick = () => {
    self.port.emit('link-clicked', url)
    removeLink({ url })
  }

  section.insertBefore(link, section.firstChild)

  links[url] = link
  self.port.emit('link-added', { url, title, favicon })
}

function togglePause () {
  const classList = document.querySelector('.button').classList

  if (classList.contains('paused')) {
    classList.remove('paused')
    self.port.emit('resume-clicked')
  } else {
    classList.add('paused')
    self.port.emit('pause-clicked')
  }
}

// Handle events

self.port.on('add-link', addLink)
self.port.on('remove-link', removeLink)
document.querySelector('.button').onclick = togglePause
