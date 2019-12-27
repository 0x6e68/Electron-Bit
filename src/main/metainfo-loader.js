const Discovery = require('torrent-discovery');
const addrToIPPort = require('addr-to-ip-port');
const Protocol = require('bittorrent-protocol');
const utMetadata = require('ut_metadata');
const bencode = require('bencode');
const net = require('net');

const SELF_HASH = '4290a5ff60130a90f1de64b1d9cc7822799affd5';

export default class MetainfoLoader {
  loadFromInfoHash (infoHash) {
    return new Promise((resolve, reject) => {
      let discovery = new Discovery({infoHash: infoHash, peerId: SELF_HASH, port: 6881, dht: true});
      discovery.on('peer', (peer) => {
        const peerAddress = {address: addrToIPPort(peer)[0], port: addrToIPPort(peer)[1]};
        getMetadata(discovery, resolve, peerAddress, infoHash);
      });

      setTimeout(() => {
        reject(new Error('timeout'));
      }, 10000);
    });
  }
}

function getMetadata (discovery, resolve, peerAddress, infoHash) {
  const socket = new net.Socket();
  socket.setTimeout(2000);
  socket.connect(peerAddress.port, peerAddress.address, () => {
    const wire = new Protocol();

    socket.pipe(wire).pipe(socket);
    wire.use(utMetadata());

    wire.handshake(infoHash, SELF_HASH, {dht: true});
    wire.on('handshake', function (infoHash, peerId) {
      wire.ut_metadata.fetch();
    });

    wire.ut_metadata.on('metadata', function (rawMetadata) {
      let metadata = bencode.decode(rawMetadata, 'utf8').info;
      metadata.infoHash = infoHash;
      socket.destroy();
      discovery.destroy();
      resolve(metadata);
    });
  });
  socket.on('error', () => {
    socket.destroy();
  });
}
