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

function convertHtmlToMarkdown(editorDiv)
{
    let markdown = '';
    let state = {
        isInsideCode: false,
        marker: ' ',
        markerNo: 0,
        listLevel: 0,
        listIndent: '',
        href: '',
    }
    let states = []
    function pushState() {
        let newState = Object.assign({}, state);
        states.push(state);
        state = newState;
    }
    function popState() {
        state = states.pop();
    }

    let actionCode = {
        beforeEnter: () => {
            if (!state.isInsideCode)
                markdown += '`';
        },
        afterEnter: () => {
            state.isInsideCode = true;
        },
        afterExit: () => {
            if (!state.isInsideCode)
                markdown += '`';
        },
    };
    let actionPre = {
        beforeEnter: () => {
            if (!state.isInsideCode)
                markdown += '\n```\n';
        },
        afterEnter: () => {
            state.isInsideCode = true;
        },
        afterExit: () => {
            if (!state.isInsideCode)
                markdown += '```\n\n';
        },
    };
    let actionParagraph = {
        afterExit: () => {
            if (!state.isInsideCode)
                markdown += '\n';
        }
    };
    let actionBlockquote = {
        afterEnter: () => {
            markdown += '>';
        },
        afterExit: () => {
            markdown += '\n';
        }
    };
    let actionText = {
        afterEnter: (node) => {
            let text = node.wholeText;
            if (!state.isInsideCode) {
                text = text.replace(/\n+/g, ' ');
            }
            markdown += text;
        }
    };
    let actionUnorderedList = {
        afterEnter: () => {
            markdown += '\n';
            state.marker = '*';
            state.listIndent = ' '.repeat(4 * state.listLevel);
            state.listLevel += 1;
        },
        afterExit: () => {
            markdown += '\n';
        },
    };
    let actionOrderedList = {
        afterEnter: () => {
            markdown += '\n';
            state.marker = '1.';
            state.markerNo = 1;
            state.listIndent = ' '.repeat(4 * state.listLevel);
            state.listLevel += 1;
        },
        afterChild: () => {
            state.markerNo += 1;
            state.marker = state.markerNo.toString() + '.';
        },
        afterExit: () => {
            markdown += '\n';
        },
    };
    let actionListItem = {
        afterEnter: () => {
            markdown += state.listIndent + state.marker + " ";
        },
        afterExit: () => {
            markdown += '\n';
        }
    };
    let actionLink = {
        afterEnter: (node) => {
            state.href = node.attributes.getNamedItem("href").value;
            markdown += '[';
        },
        beforeExit: (node) => {
            markdown += '](' + state.href + ')';
        },
    };
    let actionBold = {
        afterEnter: () => {
            markdown += '**';
        },
        beforeExit: () => {
            markdown += '**';
        }
    };
    let actionItalic = {
        afterEnter: () => {
            markdown += '***';
        },
        beforeExit: () => {
            markdown += '***';
        }
    };
    let actionImg = {
        afterEnter: (node) => {
            let src = node.attributes.getNamedItem("src").value;
            let alt = node.attributes.getNamedItem("alt").value;
            let parser = document.createElement('a');
            parser.href = src;
            src = parser.pathname + parser.search + parser.hash;

            markdown += '![' + alt + '](' + src + ')';
        },
    };
    let actionHorizontalLine = {
        afterEnter: () => {
            markdown += '\n---\n';
        },
    };
    function makeHeaderAction(level) {
        return {
            beforeEnter: () => {
                markdown += '\n' + '#'.repeat(level) + ' ';
            },
            afterExit: () => {
                markdown += '\n';
            }
        }
    }

    function selectAction(node) {
        switch (node.nodeType)
        {
        case Node.TEXT_NODE:
            return actionText;
        case Node.ELEMENT_NODE:
            switch (node.tagName) {
                case 'CODE':
                    return actionCode;
                case 'PRE':
                    return actionPre;
                case 'P':
                    return actionParagraph;
                case 'BLOCKQUOTE':
                    return actionBlockquote;
                case 'UL':
                    return actionUnorderedList;
                case 'OL':
                    return actionOrderedList;
                case 'LI':
                    return actionListItem;
                case 'A':
                    return actionLink;
                case 'IMG':
                    return actionImg;
                case 'B':
                    return actionBold;
                case 'I':
                    return actionItalic;
                case 'H1':
                    return makeHeaderAction(1);
                case 'H2':
                    return makeHeaderAction(2);
                case 'H3':
                    return makeHeaderAction(3);
                case 'H4':
                    return makeHeaderAction(4);
                case 'H5':
                    return makeHeaderAction(5);
                case 'H6':
                    return makeHeaderAction(6);
                case 'HR':
                    return actionHorizontalLine;
                default:
                    console.log("unhandled tag:", node.tagName);
                    break;
            }
            break;
        }
        return null;
    }

    function visit(node) {
        let action = selectAction(node)
        if (action) {
            if (action.beforeEnter)
                action.beforeEnter(node);
            pushState();
            if (action.afterEnter)
                action.afterEnter(node);
        }

        for (let child of node.childNodes) {
            visit(child);
            if (action && action.afterChild)
                action.afterChild(node);
        }

        if (action) {
            if (action.beforeExit)
                action.beforeExit(node);
            popState();
            if (action.afterExit)
                action.afterExit(node);
        }
    }
    visit(editorDiv);

    return markdown;
}

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
        markdownText.value = convertHtmlToMarkdown(editorDiv);
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