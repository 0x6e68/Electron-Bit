import { clipboard } from 'electron';

export interface ClipboardTextFunction {
  startsWith: string,
  execute: (content: string) => void
}

export default class ClipboardTextListener {
  private contentCache: string = '';
  private clipboardFunctions: ClipboardTextFunction[] = [];
  private interval: any = null;

  addClipboardFunction (clipboardFunction: ClipboardTextFunction) {
    this.clipboardFunctions.push(clipboardFunction);
    if (!this.interval) {
      this.interval = setInterval(this.readTextFromClipboard.bind(this), 200);
    }
  }

  readTextFromClipboard () {
    let content: string = clipboard.readText().trim();

    if (content === this.contentCache) {
      return;
    }
    this.contentCache = content;

    for (let clipboardFunction of this.clipboardFunctions) {
      if (content.startsWith(clipboardFunction.startsWith)) {
        clipboardFunction.execute(content);
      }
    }
  }
}
