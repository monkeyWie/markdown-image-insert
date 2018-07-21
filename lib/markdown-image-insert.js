'use babel';

import clipboard from 'clipboard';
import {
  CompositeDisposable
} from 'atom';
import {
  dirname,
  join
} from 'path'
import fs from 'fs';

export default {

  markdownImageInsertView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    //
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'markdown-image-insert:paste': () => this.paste()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.markdownImageInsertView.destroy();
  },

  serialize() {

  },

  paste() {
    const textEditor = atom.workspace.getActiveTextEditor();
    if (!textEditor) {
      return;
    }
    const text = clipboard.readText();
    if (text) {
      textEditor.insertText(text);
      return;
    }
    const image = clipboard.readImage();
    //clipboard.readBuffer('FileNameW').toString('ucs2')
    if (!image.isEmpty()) {
      const fileName = textEditor.getFileName();
      const index = fileName.lastIndexOf(".");
      const suffix = fileName.substring(index).toLowerCase();
      const fileNameWithoutSuffix = fileName.substring(0, index);
      if (suffix == ".md" || suffix == ".markdown") {
        let confgPath = atom.config.get("markdown-image-insert.imagePath");
        let filePath = dirname(textEditor.getPath());
        if (confgPath) {
          confgPath = confgPath.replace("${fileName}", fileName)
            .replace("${fileNameWithoutSuffix}", fileNameWithoutSuffix);
          filePath = join(filePath, confgPath);
        }
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath);
        }
        const buildName = new Date().getTime() + ".png";
        const imgPath = join(filePath, buildName);
        fs.writeFileSync(imgPath, image.toPng ? image.toPng() : image.toPNG())
        textEditor.insertText("![](" + (confgPath ? confgPath + "/" : "") + buildName + ")");
        return
      }
    }
  }

};
