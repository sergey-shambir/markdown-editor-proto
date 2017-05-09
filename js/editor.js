function MarkdownEditor()
{
  let editorDiv = document.getElementById('editor');
  let overlayDiv = document.querySelector('.markdown.overlay');
  let markdownText = document.querySelector('.markdown .popup .content');
  let popupCloseDiv = document.querySelector('.markdown .popup .popup-close');
  let copyStatusSpan = document.querySelector('.copy-clipboard .copy-status')

  let options = {
    editor: editorDiv, // {DOM Element} [required]
    debug: true, // {Boolean} false by default
    stay: true, // Stay on page when unsafe page redirect happens
    linksInNewWindow: true, // open hyperlinks in a new windows/tab,
    title: {
      'blockquote': 'Blockquote',
      'createlink': 'Hyperlink',
      'insertimage': 'Image',
    }
  };

  this.editor = new Pen(options);
  this.markdownShown = false;

  this.showMarkdownCode = function() {
    markdownText.value = this.editor.toMd();
    copyStatusSpan.classList.remove('shown');
    overlayDiv.classList.add('overlay-on');
    this.editor.destroy();
    this.markdownShown = true;
  }.bind(this);

  this.copyMarkdownCode = function() {
    if (this.markdownShown)
    {
      markdownText.select();
      document.execCommand('copy');
      copyStatusSpan.classList.add('shown');
    }
  }.bind(this);

  this.hideMarkdownCode = function() {
    this.markdownShown = false;
    this.editor.rebuild();
    overlayDiv.classList.remove('overlay-on');
  }.bind(this);

  popupCloseDiv.addEventListener('click', this.hideMarkdownCode.bind(this));
}


function initEditor()
{
  let editor = new MarkdownEditor();
  let markdownButton = document.querySelector('button.get-markdown');
  let copyClipboardButton = document.querySelector('button.copy-clipboard');
  markdownButton.addEventListener('click', editor.showMarkdownCode);
  copyClipboardButton.addEventListener('click', editor.copyMarkdownCode);
};

document.addEventListener("DOMContentLoaded", initEditor);