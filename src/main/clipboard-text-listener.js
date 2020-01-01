const {clipboard} = require('electron');

let contentCache;
const clipboardFunctions = [];

export default class ClipboardTextListener {
  constructor () {
    setInterval(this.clipboardTextReader, 200);
  }

  addClipboardFunction (clipboardFunction) {
    clipboardFunctions.push(clipboardFunction);
  }

  clipboardTextReader () {
    let content = clipboard.readText().trim();

    if (content === contentCache) {
      return;
    }
    contentCache = content;

    for (let clipboardFunction of clipboardFunctions) {
      if (content.startsWith(clipboardFunction.startsWith)) {
        clipboardFunction.execute(content);
      }
    }
  }
}
