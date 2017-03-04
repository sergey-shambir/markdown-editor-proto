
function initEditor()
{
    var editorDiv = document.getElementById('editor');
    var options = {
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
    var editor = new Pen(options);

    /*var converter = new showdown.Converter();
    converter.setOption('ghCodeBlocks', false);

    var el = document.getElementById('editor');
    el.addEventListener ("paste", function(e) {
        e.preventDefault();
        var input = e.clipboardData.getData('Text');
        var html = converter.makeHtml(input);
        e.clipboardData.setData('Text', html);
        document.execCommand("insertHTML", false, html);
        console.log(html);
    }, false);*/

    let overlayDiv = document.querySelector('.markdown.overlay');
    let markdownPre = document.querySelector('.markdown .popup .content');
    let markdownButton = document.querySelector('button.get-markdown');

    document.querySelector('button.get-markdown').addEventListener('click', function() {
        markdownPre.innerHTML = editor.toMd();
        overlayDiv.classList.add('overlay-on');
    });
    document.querySelector('.markdown .popup .popup-close').addEventListener('click', function() {
        overlayDiv.classList.remove('overlay-on');
    });
};

document.addEventListener("DOMContentLoaded", initEditor);