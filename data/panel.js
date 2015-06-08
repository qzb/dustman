/* global self, document */

var links = {};

function removeLink ({ url }) {
    if (links[url]) {
        links[url].remove();
        delete links[url];
        self.port.emit('link-removed', { url });
    }
}

function addLink ({ url, title, favicon }) {
    if (url === 'about:blank' || url === 'about:newtab') {
        return;
    }

    removeLink({ url });

    var section = document.querySelector('section.recently-closed');
    var link = document.createElement('a');
    var text = document.createTextNode(title);
    var icon = document.createElement('img');

    icon.src = favicon || 'default-favicon.png';

    link.href = url;
    link.target = '_blank';
    link.appendChild(icon);
    link.appendChild(text);
    link.onclick = () => removeLink({ url });

    links[url] = link;
    section.insertBefore(link, section.firstChild);
    self.port.emit('link-added', { url, title, favicon });
}

function togglePause () {
    var classList = document.querySelector('.button').classList;

    if (classList.contains('paused')) {
        classList.remove('paused');
        self.port.emit('resume-clicked');
    } else {
        classList.add('paused');
        self.port.emit('pause-clicked');
    }
}

// Handle events
self.port.on('add-link', addLink);
self.port.on('remove-link', removeLink);
document.querySelector('.button').onclick = togglePause;
