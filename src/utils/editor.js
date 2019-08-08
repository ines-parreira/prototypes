// @flow
import linkifyhtml from 'linkifyjs/html'
import {convertToHTML as _convertToHTML, convertFromHTML as _convertFromHTML} from 'draft-convert'
import linkifyIt from 'linkify-it'
import {ContentBlock, ContentState, EditorState, SelectionState, convertToRaw} from 'draft-js'

import {DEFAULT_IMAGE_WIDTH} from '../config/editor'
import {availableVariables} from '../config/rules'

// note that 2 letters tlds are automatically interpreted
const tlds = 'com edu gov ru org net de jp uk br it pl in fr au ir nl info cn es cz kr ca ua eu co gr za ro biz ch se io'.split(' ')
export const linkify = linkifyIt().tlds(tlds)

/**
 * Temporarily adds an uid at the end of each {{variable}} (eg. {{variable}}123),
 * runs the callback on the new string, then removes the uid.
 * Required for supporting links ending with variables (eg. www.google.com/{{ticket.id}}).
 *
 * @param {String} field the field path. E.g: ticket.customer.id
 * @param {Function} function to run on the string
 * @returns {String} parsed string with removed uids
 */
const fixLinkVars = (html: string, callback: (T: string) => string): string => {
    // use a uid, so we don't accidentally replace something else.
    const uid = String(Date.now())
    // add uid at the end of the variables,
    // this makes urls with {{}} valid.
    const replacedHtml = html.replace(/{{.*?}}/g, (match) => `${match}${uid}`)
    // synchronous extra parsing (eg. linkify)
    const parsedHtml = callback(replacedHtml) || replacedHtml
    // remove the added uid
    const restoreRegex = new RegExp(`{{.*?}}${uid}`, 'g')
    return parsedHtml.replace(restoreRegex, (match) => match.replace(uid, ''))
}

/**
 * Single convertToHTML config for the entire app (same options everywhere if needed)
 * @param contentState
 */
export function convertToHTML(contentState: ContentState): string {
    return fixLinkVars(_convertToHTML({
        blockToHTML: {
            unstyled: {
                start: '<div>',
                end: '</div>',
                empty: '<br>' // when we have an empty block (corresponds with a new line, add a line break)
            },
            atomic: {
                start: '<figure style="display: inline-block; margin: 0">',
                end: '</figure>'
            }
        },
        entityToHTML: (entity, originalText) => {
            if (entity.type === 'link') {
                // keep the start/end way of doing until https://github.com/HubSpot/draft-convert/issues/47 is fixed
                return {
                    start: `<a href="${entity.data.url}" target="_blank">`,
                    end: '</a>',
                }
            }

            if (entity.type === 'img') {
                const width = entity.data.width || DEFAULT_IMAGE_WIDTH

                // keep the start/end way of doing until https://github.com/HubSpot/draft-convert/issues/47 is fixed
                return `<img src="${entity.data.src}" width="${width}px" style="max-width: 100%" />`
            }

            if (entity.type === 'mention') {
                return {
                    start: '<span class="gorgias-mention">',
                    end: '</span>'
                }
            }

            // don't output predictions in html
            if (entity.type === 'prediction') {
                return ''
            }

            return originalText
        }
    })(contentState), (str) => {
        // linkify transforms linkified urls into actual HTML links
        return linkifyhtml(str, {
            validate: {
                url(value) {
                    return linkify.test(value)
                }
            }
        })
    })
}

/**
 * Unescape template variables from a string
 *
 * Input: `send email to %7B%7Bticket.customer.email%7D%7D`
 * Output: `send email to {{ticket.customer.email}}`
 */
export function unescapeTemplateVars(string: string): string {
    // `%7B%7B` : {{
    // `(?:${availableVariables.join('|')})` : variable needs to start by one of the available variable names in rules
    // `[\w\.\[\]` : followed by alphanumeric, dot or square bracket characters
    // `%7D%7D` : }}
    const reg = new RegExp(`%7B%7B((?:${availableVariables.join('|')})[\\w\\.\\[\\]]*?)%7D%7D`, 'g')
    return string.replace(reg, (_, match) => {
        return `{{${match}}}`
    })
}

/**
 * Single convertFromHTML config for the entire app (same options everywhere if needed)
 * @param html
 */
export function convertFromHTML(html: string): ContentState {
    let converted = _convertFromHTML({
        htmlToBlock: (nodeName) => {
            if (nodeName === 'figure' || nodeName === 'img') {
                return 'atomic'
            }
        },
        htmlToEntity: (nodeName, node, createEntity) => {
            if (nodeName === 'a') {
                return createEntity(
                    'link',
                    'MUTABLE',
                    {url: unescapeTemplateVars(node.href)}
                )
            }

            if (nodeName === 'img') {
                return createEntity(
                    'img',
                    'MUTABLE',
                    {
                        src: node.src,
                        width: node.width || DEFAULT_IMAGE_WIDTH,
                    }
                )
            }
        },
    })(html)

    // line breaks for windows/linux/mac
    const lineBreaks = ['\r\n', '\n', '\r']

    const blocks = converted.getBlocksAsArray().map((block) => {
        const type = block.getType()
        let newBlock = block
        if (type === 'atomic') {
            // remove the default 'a' character in atomic blocks so that text from getPlainText() of this contentState that not
            // carry a 'a' where images are supposed to be displayed
            // see https://github.com/HubSpot/draft-convert/issues/30
            newBlock = newBlock.set('text', ' ')
        } else if (type === 'unstyled') {
            // remove the last newline in a block,
            // otherwise it appears as an extra newline in the editor,
            // because draft-uses uses white-space: pre-wrap.
            let text = newBlock.get('text')
            lineBreaks.some((char) => {
                const lastPos = text.length - char.length
                if (text.substring(lastPos) === char) {
                    newBlock = newBlock.set('text', text.substring(0, lastPos))
                    return true
                }
            })
        }

        return newBlock
    })

    converted = ContentState.createFromBlockArray(blocks)

    return converted
}

export function contentStateFromTextOrHTML(text: string, html?: string): ContentState {
    let contentState = ContentState.createFromText('')

    if (html) {
        contentState = convertFromHTML(html)
    } else if (text) {
        contentState = ContentState.createFromText(text)
    }

    return contentState
}

// get selectionState around a specific entity.
// draft doesn't support removing an entity by key, only all entities in a selection,
// so we use the selection to isolate one entity.
export function getEntitySelectionState(contentState: ContentState, entityKey: string): ?SelectionState {
    let entitySelection
    const blocks = contentState.getBlockMap()
    blocks.some((block) => {
        block.findEntityRanges(
            (character) => {
                return character.getEntity() === entityKey
            },
            (start, end) => {
                entitySelection = SelectionState.createEmpty(block.getKey())
                    .set('anchorOffset', start)
                    .set('focusOffset', end)
            }
        )

        return !!entitySelection
    })
    return entitySelection
}

export function getSelectedText(contentState: ContentState, selection: SelectionState): string {
    const startKey = selection.getStartKey()
    const endKey = selection.getEndKey()
    const blockMap = contentState.getBlockMap()
    return blockMap
        .skipUntil((b: ContentBlock) => b.getKey() === startKey)
        .takeUntil((b: ContentBlock) => b.getKey() === endKey)
        .concat([[endKey, blockMap.get(endKey)]])
        .reduce(
            (acc: string, block: ContentBlock) => {
                const key = block.getKey()
                const text = block.getText()
                return acc + text.slice(
                    key === startKey ? selection.getStartOffset() : 0,
                    key === endKey ? selection.getEndOffset() : text.length
                )
            },
            ''
        )
}

// Enitity selection behavior is based on Gmail's editor link toggle functionality
export function getSelectedEntityKey(contentState: ContentState, selection: SelectionState): ?string {
    const block = contentState.getBlockForKey(selection.getStartKey())
    const endOffset = selection.getEndOffset() - 1

    if (endOffset < 0 || selection.getStartKey() !== selection.getEndKey()) {
        return
    }

    const entityKey = block.getEntityAt(endOffset)

    if (!entityKey || (!selection.isCollapsed() && entityKey !== block.getEntityAt(selection.getStartOffset()))) {
        return
    }

    return entityKey
}

export function removeMentions(editorState: EditorState): EditorState {
    const contentState = editorState.getCurrentContent()
    // use convertFromHTML to create a new content state w/o mention
    // because mentions are not present in the html of the body
    const newEditorState = convertFromHTML(convertToHTML(contentState))
    return EditorState.push(editorState, newEditorState, 'change-block-data')
}

export function refreshEditor(editorState: EditorState): EditorState {
    const contentState = editorState.getCurrentContent()
    const newEditorState = EditorState.createWithContent(contentState, editorState.getDecorator())
    return EditorState.set(newEditorState, {
        selection: editorState.getSelection(),
        undoStack: editorState.getUndoStack(),
        redoStack: editorState.getRedoStack(),
        lastChangeType: editorState.getLastChangeType()
    })
}

export function isValidSelectionKey(editorState: EditorState, selectionState: SelectionState): boolean {
    const contentState = editorState.getCurrentContent()
    const anchorKey = selectionState.getAnchorKey()
    if (!contentState.getBlockForKey(anchorKey)) {
        return false
    }

    const focusKey = selectionState.getFocusKey()
    if (anchorKey !== focusKey && !contentState.getBlockForKey(focusKey)) {
        return false
    }

    return true
}

// Replacement for DraftJS getPlainText:
// https://github.com/facebook/draft-js/blob/e2c5357734de2a66025825c2872cc236a154d60c/src/model/immutable/ContentState.js#L115
// Used to correctly transform rich entities into plaintext (links, images, etc..)
export function getPlainText(ContentState: ContentState, delimiter?: string): string {
    return convertToRaw(ContentState).blocks.map((rawBlock) => {
        let blockText = rawBlock.text || ''
        let totalOffset = 0

        rawBlock.entityRanges.forEach((rawEntity) => {
            const block = ContentState.getBlockForKey(rawBlock.key)
            const entityKey = block.getEntityAt(rawEntity.offset)
            if (entityKey === null) {
                // bail if we can't find entity.
                // strings with unicode chars (eg. emojis) will cause
                // entity.offset and getEntity(offset) to mismatch.
                // draft-js considers unicode 1 char in convertToRaw and multiple chars in getEntityAt.
                // will be fixed with draft-js 11:
                // https://github.com/robbertbrak/draft-js/commit/396d30412783bf93b64558661efb88da783e2467
                // https://github.com/facebook/draft-js/issues/1351
                // https://github.com/facebook/draft-js/issues/2061
                // https://github.com/facebook/draft-js/issues/1861
                // TODO upgrade to draft-js 11 when released.
                return
            }
            const entity = ContentState.getEntity(entityKey)

            // Links like <a href="http://x.io">x</a> will output as x: http://x.io plain text.
            if (entity.get('type') === 'link') {
                const entityOffset = rawEntity.offset + totalOffset
                const linkContent = blockText.slice(entityOffset, entityOffset + rawEntity.length)
                const linkURL = entity.getData().url

                // only append the URL if it's different from the content of the link.
                // Ex: <a href="https://gorgias.io/">https://gorgias.io</a> -> https://gorgias.io
                if (linkContent.toLowerCase() === linkURL.toLowerCase() ||
                    // if the URL does not have a ending slash it will be automatically added so we check for it here
                    linkContent.toLowerCase() + '/' === linkURL.toLowerCase()) {
                    return
                }

                const position = rawEntity.offset + rawEntity.length + totalOffset
                const newText = `: ${linkURL}`
                totalOffset = totalOffset + newText.length

                blockText = blockText.slice(0, position) + newText + blockText.slice(position)
            }
        })

        return blockText
    }).join(delimiter || '\n')
}
