var urls = [];

function addLink({ url, title, favicon }) {
    if (url === 'about:blank' || url === 'about:newtab') {
        return;
    }

    var section = document.querySelector('section.recently-closed');
    var link = document.createElement('a');
    var text = document.createTextNode(title);
    var icon = document.createElement('img');

    if (favicon) {
        icon.src = favicon;
        link.appendChild(icon);
    }

    link.href = url;
    link.target = '_blank';
    link.appendChild(text);
    link.onclick = function (ev) {
        ev.target.remove();
    };

    section.insertBefore(link, section.firstChild);
}

self.port.on('tab-close', addLink);


document.querySelector('.button').onclick = function (evt) {
    var classList = document.querySelector('.button').classList;

    if (classList.contains('paused')) {
        classList.remove('paused');
        self.port.emit('resume');
    } else {
        classList.add('paused');
        self.port.emit('pause');
    }
};
