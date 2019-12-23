
window.ipcRenderer.on('torrent-detected', (event, torrent) => {
    console.log(torrent.name);
    console.log(torrent);

});
