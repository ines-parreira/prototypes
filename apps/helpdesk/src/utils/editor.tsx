import { cloneElement } from 'react'

import { countWords, truncateWords } from '@repo/utils'
import type { IConvertFromHTMLConfig } from 'draft-convert'
import {
    convertFromHTML as _convertFromHTML,
    convertToHTML as _convertToHTML,
} from 'draft-convert'
import type { ContentBlock } from 'draft-js'
import {
    ContentState,
    convertToRaw,
    EditorState,
    Modifier,
    SelectionState,
} from 'draft-js'
import type { Map } from 'immutable'
import linkifyhtml from 'linkify-html'
import _kebabeCase from 'lodash/kebabCase'

import { draftjsGorgiasCustomBlockRenderers } from 'common/editor'
import { HORIZONTAL_RULE_ENTITY } from 'pages/common/draftjs/plugins/horizontalRule'
import {
    getQuoteDepth,
    QUOTE_DEPTH_DATA_KEY,
} from 'pages/common/draftjs/plugins/quotes/quotesEditorUtils'
import { replaceAttachmentURLToExternalSource } from 'utils'

import { DEFAULT_IMAGE_WIDTH, DEFAULT_VIDEO_WIDTH } from '../config/editor'
import { availableVariables } from '../config/rules'
import { parseHtml } from './html'
import { linkify } from './linkify'
import { ComposedElements } from './react'

const QUOTE_CLASS_NAME = 'gorgias_quote'
const QUOTE_DEPTH_DATASET_KEY = 'gorgiasQuoteDepth'

export enum EditorBlockType {
    Unstyled = 'unstyled',
    CodeBlock = 'code-block',
    OrderedListItem = 'ordered-list-item',
    UnorderedListItem = 'unordered-list-item',
    HeaderOne = 'header-one',
    HeaderTwo = 'header-two',
    HeaderThree = 'header-three',
    HeaderFour = 'header-four',
    HeaderFive = 'header-five',
    HeaderSix = 'header-six',
    Atomic = 'atomic',
    Blockquote = 'blockquote',
}

export enum EditorHandledNotHandled {
    Handled = 'handled',
    NotHandled = 'not-handled',
}

const BLOCK_TO_HTML: Record<
    EditorBlockType,
    {
        element: React.ReactElement
        nest?: React.ReactElement
        empty?: React.ReactElement
    }
> = Object.freeze({
    [EditorBlockType.Unstyled]: {
        element: <div />,
        empty: (
            <ComposedElements
                elements={[
                    <div key="empty-block-wrapper" />,
                    <br key="empty-block-newline" />,
                ]}
            />
        ),
    },
    [EditorBlockType.CodeBlock]: { element: <pre /> },
    [EditorBlockType.Atomic]: {
        element: (
            <figure
                style={{
                    display: 'inline-block',
                    margin: 0,
                }}
            />
        ),
    },
    [EditorBlockType.Blockquote]: { element: <blockquote /> },
    [EditorBlockType.OrderedListItem]: {
        element: <li />,
        nest: <ol />,
    },
    [EditorBlockType.UnorderedListItem]: {
        element: <li />,
        nest: <ul />,
    },
    // eslint-disable-next-line jsx-a11y/heading-has-content
    [EditorBlockType.HeaderOne]: { element: <h1 /> },
    // eslint-disable-next-line jsx-a11y/heading-has-content
    [EditorBlockType.HeaderTwo]: { element: <h2 /> },
    // eslint-disable-next-line jsx-a11y/heading-has-content
    [EditorBlockType.HeaderThree]: { element: <h3 /> },
    // eslint-disable-next-line jsx-a11y/heading-has-content
    [EditorBlockType.HeaderFour]: { element: <h4 /> },
    // eslint-disable-next-line jsx-a11y/heading-has-content
    [EditorBlockType.HeaderFive]: { element: <h5 /> },
    // eslint-disable-next-line jsx-a11y/heading-has-content
    [EditorBlockType.HeaderSix]: { element: <h6 /> },
})

const HTML_TO_BLOCK: Record<string, EditorBlockType> = Object.freeze({
    br: EditorBlockType.Unstyled,
    div: EditorBlockType.Unstyled,
    p: EditorBlockType.Unstyled,
    pre: EditorBlockType.CodeBlock,
    h1: EditorBlockType.HeaderOne,
    h2: EditorBlockType.HeaderTwo,
    h3: EditorBlockType.HeaderThree,
    h4: EditorBlockType.HeaderFour,
    h5: EditorBlockType.HeaderFive,
    h6: EditorBlockType.HeaderSix,
    figure: EditorBlockType.Atomic,
    img: EditorBlockType.Atomic,
    blockquote: EditorBlockType.Blockquote,
})

const OL_TYPES = ['1', 'a', 'i'] as const

function getOrderedListNestElement(depth: number, start?: number) {
    const olType = OL_TYPES[depth % OL_TYPES.length]
    return start && start > 1 ? (
        <ol type={olType} start={start} />
    ) : (
        <ol type={olType} />
    )
}

const QUOTE_HTML_ELEMENT = (
    <blockquote
        className={QUOTE_CLASS_NAME}
        style={{
            margin: '0 0 0 .8ex',
            borderLeft: '1px #ccc solid',
            paddingLeft: '1ex',
            overflow: 'auto',
        }}
    />
)

/**
 * Temporarily adds an uid at the end of each {{variable}} (eg. {{variable}}123),
 * runs the callback on the new string, then removes the uid.
 * Required for supporting links ending with variables (eg. www.google.com/{{ticket.id}}).
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
 */
export function convertToHTML(contentState: ContentState): string {
    return fixLinkVars(
        _convertToHTML({
            blockToHTML: (block) => {
                const { type, key, depth } = block
                const contentBlock = contentState.getBlockForKey(key)
                const quoteDepth = getQuoteDepth(contentBlock)
                const blockTag = BLOCK_TO_HTML[type as EditorBlockType]
                if (blockTag) {
                    const resolvedNest = (() => {
                        if (type !== EditorBlockType.OrderedListItem)
                            return blockTag.nest
                        const listStart = contentBlock
                            .getData()
                            .get('listStart') as number | undefined
                        if (listStart && listStart > 1) {
                            const blockBefore = contentState.getBlockBefore(key)
                            if (
                                !blockBefore ||
                                blockBefore.getType() !==
                                    EditorBlockType.OrderedListItem
                            ) {
                                return getOrderedListNestElement(
                                    depth,
                                    listStart,
                                )
                            }
                        }
                        return getOrderedListNestElement(depth)
                    })()

                    const isListItem =
                        type === EditorBlockType.OrderedListItem ||
                        type === EditorBlockType.UnorderedListItem
                    const needsDepthAttr = !isListItem && depth > 0
                    const visualListStyle = contentBlock
                        .getData()
                        .get('visualListStyle') as string | undefined

                    if (quoteDepth === 0) {
                        const extraAttrs: Record<string, unknown> = {}
                        if (needsDepthAttr) {
                            extraAttrs['data-depth'] = depth
                        }
                        if (isListItem && visualListStyle) {
                            extraAttrs['data-visual-list-style'] =
                                visualListStyle
                        }

                        if (Object.keys(extraAttrs).length > 0) {
                            return {
                                ...blockTag,
                                element: cloneElement(
                                    blockTag.element,
                                    extraAttrs,
                                ),
                                ...(blockTag.empty
                                    ? {
                                          empty: cloneElement(
                                              blockTag.empty,
                                              extraAttrs,
                                          ),
                                      }
                                    : {}),
                                nest: resolvedNest,
                            }
                        }
                        return resolvedNest !== blockTag.nest
                            ? { ...blockTag, nest: resolvedNest }
                            : blockTag
                    }
                    const { element, empty } = blockTag
                    const nest = resolvedNest
                    const quoteElements = Array.from(
                        { length: quoteDepth },
                        (value, i) =>
                            cloneElement(QUOTE_HTML_ELEMENT, {
                                key: `quote-level-${i}`,
                            }),
                    )
                    const quoteDataAttr = {
                        [`data-${_kebabeCase(QUOTE_DEPTH_DATASET_KEY)}`]:
                            quoteDepth,
                    }
                    return {
                        element: nest ? (
                            cloneElement(element, quoteDataAttr)
                        ) : (
                            <ComposedElements
                                elements={[
                                    ...quoteElements,
                                    cloneElement(element, quoteDataAttr),
                                ]}
                            />
                        ),
                        empty: empty && (
                            <ComposedElements
                                elements={[
                                    ...quoteElements,
                                    cloneElement(empty, quoteDataAttr),
                                ]}
                            />
                        ),
                        nest:
                            nest &&
                            (depth > 0 ? (
                                nest
                            ) : (
                                <ComposedElements
                                    elements={[...quoteElements, nest]}
                                />
                            )),
                    }
                }
            },
            entityToHTML: (entity, originalText) => {
                if (entity.type === 'link') {
                    // keep the start/end way of doing until https://github.com/HubSpot/draft-convert/issues/47 is fixed
                    return {
                        start: `<a href="${
                            entity.data.url as string
                        }" target="${entity.data.target || '_blank'}"${
                            'templatedUrl' in entity.data
                                ? ` data-templated-url="${entity.data.templatedUrl}"`
                                : ''
                        }>`,
                        end: '</a>',
                    }
                }

                if (entity.type === draftjsGorgiasCustomBlockRenderers.Img) {
                    const width = entity.data.width || DEFAULT_IMAGE_WIDTH

                    // keep the start/end way of doing until https://github.com/HubSpot/draft-convert/issues/47 is fixed
                    return `<img src="${entity.data.src as string}" width="${
                        width as number
                    }" style="max-width: 100%" />`
                }

                if (entity.type === draftjsGorgiasCustomBlockRenderers.Video) {
                    const width: number =
                        (entity.data.width as number) || DEFAULT_VIDEO_WIDTH
                    const url: string = (entity.data.url as string) || ''
                    return `<div class="gorgias-video-container" data-video-src="${url}" width="${width}"></div>`
                }

                if (
                    entity.type ===
                    draftjsGorgiasCustomBlockRenderers.DiscountCodeLink
                ) {
                    const url: string = (entity.data.url as string) || ''
                    const code: string = (entity.data.code as string) || ''
                    return `<a data-discount-code="${code}" href="${url}" target="_blank" rel="noreferrer">${code}</a>`
                }

                if (entity.type === HORIZONTAL_RULE_ENTITY) {
                    return '<hr />'
                }

                if (entity.type === 'mention') {
                    return {
                        start: '<span class="gorgias-mention">',
                        end: '</span>',
                    }
                }

                // don't output predictions in html
                if (entity.type === 'prediction') {
                    return ''
                }

                return originalText
            },
        })(contentState as any),
        (str) => {
            // linkify transforms linkified urls into actual HTML links
            return linkifyhtml(str, {
                className: 'linkified',
                target: (_href: unknown, type: string) =>
                    type === 'url' ? '_blank' : '_self',
                validate: {
                    url(value: any) {
                        return linkify.test(value)
                    },
                },
            })
        },
    )
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
    const reg = new RegExp(
        `%7B%7B((?:${availableVariables.join('|')})[\\w\\.\\[\\]]*?)%7D%7D`,
        'g',
    )
    return string.replace(reg, (_, match) => {
        return `{{${match as string}}}`
    })
}

/**
 * Replace gorgias quote elements that were created by convertToHTML
 * with its child nodes.
 */
const removeGorgiasQuoteNodes = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
        removeGorgiasQuoteNodes(child)
    }

    if (
        node &&
        node.nodeName === 'BLOCKQUOTE' &&
        (node as HTMLElement).classList.contains(QUOTE_CLASS_NAME)
    ) {
        for (const child of Array.from(node.childNodes)) {
            node.parentNode?.insertBefore(child, node)
        }
        node.parentNode?.removeChild(node)
    }
}

const unwrapParagraphsInListItems = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
        unwrapParagraphsInListItems(child)
    }

    if (
        node.nodeName === 'P' &&
        node.parentNode &&
        node.parentNode.nodeName === 'LI'
    ) {
        for (const child of Array.from(node.childNodes)) {
            node.parentNode.insertBefore(child, node)
        }
        node.parentNode.removeChild(node)
    }
}

const flattenNestedListsInListItems = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
        flattenNestedListsInListItems(child)
    }

    if (
        (node.nodeName === 'UL' || node.nodeName === 'OL') &&
        node.parentNode &&
        node.parentNode.nodeName === 'LI'
    ) {
        const li = node.parentNode
        const liParent = li.parentNode
        if (liParent) {
            liParent.insertBefore(node, li.nextSibling)
        }
    }
}

/**
 * Single convertFromHTML config for the entire app (same options everywhere if needed)
 * @param html
 */
export function convertFromHTML(html: string): ContentState {
    // We need to remove quote blockquote elements from the dom,
    // otherwise draft-convert will try to convert them to the editor blocks
    const wrapper = parseHtml(html).body
    removeGorgiasQuoteNodes(wrapper)
    unwrapParagraphsInListItems(wrapper)
    flattenNestedListsInListItems(wrapper)

    let converted: ContentState = _convertFromHTML({
        htmlToBlock: (nodeName: string, node) => {
            let blockType
            const data: Record<string, unknown> = {}

            if (nodeName === 'hr') {
                return {
                    type: EditorBlockType.Atomic,
                    data: {},
                }
            }

            if (
                node instanceof HTMLElement &&
                node.dataset[QUOTE_DEPTH_DATASET_KEY]
            ) {
                data[QUOTE_DEPTH_DATA_KEY] = parseInt(
                    node.dataset[QUOTE_DEPTH_DATASET_KEY],
                )
            }

            blockType = HTML_TO_BLOCK[nodeName]
            if (nodeName === 'li') {
                blockType =
                    node.parentNode?.nodeName === 'UL'
                        ? EditorBlockType.UnorderedListItem
                        : EditorBlockType.OrderedListItem

                if (
                    node.parentNode?.nodeName === 'OL' &&
                    (node as HTMLElement).previousElementSibling === null
                ) {
                    const olStart = parseInt(
                        (node.parentNode as HTMLOListElement).getAttribute(
                            'start',
                        ) || '1',
                        10,
                    )
                    if (olStart > 1) {
                        data.listStart = olStart
                    }
                }
            }

            if (node instanceof HTMLElement && node.dataset.depth) {
                data.__depth = parseInt(node.dataset.depth, 10)
            }

            if (node instanceof HTMLElement && node.dataset.visualListStyle) {
                data.visualListStyle = node.dataset.visualListStyle
            }

            return (
                blockType && {
                    type: blockType,
                    data,
                }
            )
        },
        htmlToEntity: (nodeName: string, node: HTMLElement, createEntity) => {
            if (nodeName === 'hr') {
                return createEntity(HORIZONTAL_RULE_ENTITY, 'IMMUTABLE', {})
            }

            if (nodeName === 'a' && node.getAttribute('data-discount-code')) {
                return createEntity(
                    draftjsGorgiasCustomBlockRenderers.DiscountCodeLink,
                    'IMMUTABLE',
                    {
                        url: node.getAttribute('href'),
                        code: node.getAttribute('data-discount-code'),
                    },
                )
            }

            if (nodeName === 'a') {
                const url = (node as HTMLLinkElement).href
                const templatedUrl = node.getAttribute('data-templated-url')
                const target = node.getAttribute('target')

                return createEntity('link', 'MUTABLE', {
                    url: unescapeTemplateVars(templatedUrl || url),
                    ...(templatedUrl ? { templatedUrl } : {}),
                    target,
                })
            }

            if (nodeName === 'img') {
                const src = replaceAttachmentURLToExternalSource(
                    (node as HTMLImageElement).src,
                )

                return createEntity(
                    draftjsGorgiasCustomBlockRenderers.Img,
                    'MUTABLE',
                    {
                        src,
                        width:
                            (node as HTMLImageElement).width ||
                            DEFAULT_IMAGE_WIDTH,
                    },
                )
            }

            if (
                nodeName === 'div' &&
                node.classList.contains('gorgias-video-container')
            ) {
                return createEntity(
                    draftjsGorgiasCustomBlockRenderers.Video,
                    'MUTABLE',
                    {
                        url: node.getAttribute('data-video-src'),
                        width:
                            node.getAttribute('width') || DEFAULT_VIDEO_WIDTH,
                    },
                )
            }
        },
    } as IConvertFromHTMLConfig)(wrapper.innerHTML)

    // line breaks for windows/linux/mac
    const lineBreaks = ['\r\n', '\n', '\r']

    const blocks = converted.getBlocksAsArray().map((block) => {
        const type = block.getType()
        let newBlock = block
        if (type === 'atomic' && newBlock.getText()) {
            // remove the default 'a' character in atomic blocks so that text from getPlainText() of this contentState that not
            // carry a 'a' where images are supposed to be displayed
            // see https://github.com/HubSpot/draft-convert/issues/30
            newBlock = newBlock.set('text', ' ') as ContentBlock
        } else if (type === 'unstyled') {
            // remove the last newline in a block,
            // otherwise it appears as an extra newline in the editor,
            // because draft-uses uses white-space: pre-wrap.
            const text = newBlock.get('text') as string
            lineBreaks.some((char) => {
                const lastPos = text.length - char.length
                if (text.substring(lastPos) === char) {
                    newBlock = newBlock.set(
                        'text',
                        text.substring(0, lastPos),
                    ) as ContentBlock
                    return true
                }
            })
        }

        const blockData = newBlock.getData()
        const savedDepth = blockData.get('__depth') as number | undefined
        if (savedDepth !== undefined && savedDepth > 0) {
            newBlock = newBlock.set('depth', savedDepth) as ContentBlock
            newBlock = newBlock.set(
                'data',
                blockData.delete('__depth'),
            ) as ContentBlock
        }

        return newBlock
    })

    converted = ContentState.createFromBlockArray(blocks)

    return converted
}

export function contentStateFromTextOrHTML(
    text?: string,
    html?: string,
): ContentState {
    let contentState = ContentState.createFromText('')

    if (html) {
        contentState = convertFromHTML(html)
    } else if (text) {
        contentState = ContentState.createFromText(text)
    }

    return contentState
}

export function containsMarkdownSyntax(text: string): boolean {
    if (!text || text.trim().length === 0) {
        return false
    }

    const patterns = [
        // Headers: # Heading, ## Heading, etc. (must start line)
        /^#{1,6}\s+/m,
        // Bold: **text** or __text__ (double delimiters)
        /(\*\*|__).+?\1/,
        // Italic: *text* or _text_ (single delimiters, not mid-word)
        /(?<!\w)(\*|_)(?!\s).+?(?<!\s)\1(?!\w)/,
        // Unordered lists: * item or - item (must start line with space after)
        /^[\*\-]\s+/m,
        // Ordered lists: 1. item, 2. item, etc. (must start line with space after)
        /^\d+\.\s+/m,
        // Links: [text](url) or images: ![alt](url)
        /!?\[.+?\]\(.+?\)/,
        // Code blocks: ```code```
        /```[\s\S]*?```/,
        // Inline code: `code`
        /`[^`]+`/,
        // Blockquotes: > quote (must start line)
        /^>\s+/m,
        // Horizontal rules: ---, ***, or ___ (3 or more, must be on own line)
        /^(\*{3,}|-{3,}|_{3,})$/m,
    ]

    return patterns.some((pattern) => pattern.test(text))
}

export function editorStateWithReplacedText(
    editorState: EditorState,
    text: string,
): EditorState {
    const contentState = contentStateFromTextOrHTML(text)
    return EditorState.push(editorState, contentState, 'insert-characters')
}

// get selectionState around a specific entity.
// draft doesn't support removing an entity by key, only all entities in a selection,
// so we use the selection to isolate one entity.
export function getEntitySelectionState(
    contentState: ContentState,
    entityKey: string,
): Maybe<SelectionState> {
    let entitySelection: Maybe<SelectionState>
    const blocks = contentState.getBlockMap()
    blocks.some((block) => {
        ;(block as ContentBlock).findEntityRanges(
            (character) => {
                return character.getEntity() === entityKey
            },
            (start, end) => {
                entitySelection = SelectionState.createEmpty(
                    (block as ContentBlock).getKey(),
                )
                    .set('anchorOffset', start)
                    .set('focusOffset', end) as SelectionState
            },
        )

        return !!entitySelection
    })
    return entitySelection
}

export function getSelectedText(
    contentState: ContentState,
    selection: SelectionState,
): string {
    const startKey = selection.getStartKey()
    const endKey = selection.getEndKey()
    const blockMap = contentState.getBlockMap()
    return blockMap
        .skipUntil((b) => (b as ContentBlock).getKey() === startKey)
        .takeUntil((b) => (b as ContentBlock).getKey() === endKey)
        .concat([[endKey, blockMap.get(endKey)]])
        .reduce((acc = '', block) => {
            const key = (block as ContentBlock).getKey()
            const text = (block as ContentBlock).getText()
            return (
                acc +
                text.slice(
                    key === startKey ? selection.getStartOffset() : 0,
                    key === endKey ? selection.getEndOffset() : text.length,
                )
            )
        }, '')
}

// Entity selection behavior is based on Gmail's editor link toggle functionality
export function getSelectedEntityKey(
    contentState: ContentState,
    selection: SelectionState,
): Maybe<string> {
    const block = contentState.getBlockForKey(selection.getStartKey())
    const endOffset = selection.getEndOffset() - 1

    if (endOffset < 0 || selection.getStartKey() !== selection.getEndKey()) {
        return
    }

    const entityKey = block.getEntityAt(endOffset)

    if (
        !entityKey ||
        (!selection.isCollapsed() &&
            entityKey !== block.getEntityAt(selection.getStartOffset()))
    ) {
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
    const newEditorState = EditorState.createWithContent(
        contentState,
        editorState.getDecorator(),
    )
    const withState = EditorState.set(newEditorState, {
        undoStack: editorState.getUndoStack(),
        redoStack: editorState.getRedoStack(),
        lastChangeType: editorState.getLastChangeType(),
    })
    return EditorState.acceptSelection(withState, editorState.getSelection())
}

export function isValidSelectionKey(
    editorState: EditorState,
    selectionState: SelectionState,
): boolean {
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

const decorateTextWithQuotes = (blockText: string, depth: number): string => {
    return depth <= 0
        ? blockText
        : Array.from({ length: depth }, () => '>').join('') + ' ' + blockText
}

// Replacement for DraftJS getPlainText:
// https://github.com/facebook/draft-js/blob/e2c5357734de2a66025825c2872cc236a154d60c/src/model/immutable/ContentState.js#L115
// Used to correctly transform rich entities into plaintext (links, images, etc..)
export function getPlainText(
    ContentState: ContentState,
    delimiter?: string,
): string {
    return convertToRaw(ContentState)
        .blocks.map((rawBlock) => {
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
                if (
                    (entity as unknown as Map<any, any>).get('type') === 'link'
                ) {
                    const entityOffset = rawEntity.offset + totalOffset
                    const linkContent = blockText.slice(
                        entityOffset,
                        entityOffset + rawEntity.length,
                    )
                    const linkURL = (
                        entity.getData() as Record<string, unknown>
                    ).url as string

                    // only append the URL if it's different from the content of the link.
                    // Ex: <a href="https://gorgias.io/">https://gorgias.io</a> -> https://gorgias.io
                    if (
                        linkContent.toLowerCase() === linkURL.toLowerCase() ||
                        // if the URL does not have a ending slash it will be automatically added so we check for it here
                        linkContent.toLowerCase() + '/' ===
                            linkURL.toLowerCase()
                    ) {
                        return
                    }

                    const position =
                        rawEntity.offset + rawEntity.length + totalOffset
                    const newText = `: ${linkURL}`
                    totalOffset = totalOffset + newText.length

                    blockText =
                        blockText.slice(0, position) +
                        newText +
                        blockText.slice(position)
                }
            })

            return decorateTextWithQuotes(
                blockText,
                getQuoteDepth(ContentState.getBlockForKey(rawBlock.key)),
            )
        })
        .join(delimiter || '\n')
}

export const createCollapsedSelectionState = (
    key: string,
    offset: number,
): SelectionState => {
    return SelectionState.createEmpty(key)
        .set('anchorOffset', offset)
        .set('focusOffset', offset) as unknown as SelectionState
}

export const insertNewBlockAtTheEnd = (
    contentState: ContentState,
): ContentState => {
    const lastBlock = contentState.getLastBlock()
    return Modifier.splitBlock(
        contentState,
        createCollapsedSelectionState(
            lastBlock.getKey(),
            lastBlock.getLength(),
        ),
    )
}

export const insertNewBlockAtTheBeginning = (contentState: ContentState) => {
    return Modifier.splitBlock(
        contentState,
        createCollapsedSelectionState(contentState.getFirstBlock().getKey(), 0),
    )
}

export const mergeContentStates = (
    contentState1: ContentState,
    contentState2: ContentState,
): ContentState => {
    const contentState = insertNewBlockAtTheEnd(contentState1)
    const lastBlock = contentState.getLastBlock()
    return Modifier.replaceWithFragment(
        contentState,
        createCollapsedSelectionState(
            lastBlock.getKey(),
            lastBlock.getLength(),
        ),
        contentState2.getBlockMap(),
    )
}

export const selectWholeContentState = (
    contentState: ContentState,
): SelectionState => {
    return SelectionState.createEmpty(contentState.getFirstBlock().getKey())
        .set('focusKey', contentState.getLastBlock().getKey())
        .set(
            'focusOffset',
            contentState.getLastBlock().getLength(),
        ) as SelectionState
}

export function findContentState(
    parentContentState: ContentState,
    contentState: ContentState,
): SelectionState | null {
    let selectionState = SelectionState.createEmpty('')
    const parentBlocks = parentContentState.getBlocksAsArray()
    const blocks = contentState.getBlocksAsArray()
    const clearKeys = {
        key: '',
        characterList: [],
    }

    let j = 0
    for (const parentBlock of parentBlocks) {
        const parentBlockKey = parentBlock.getKey()
        if (parentBlock.merge(clearKeys).equals(blocks[j].merge(clearKeys))) {
            j++

            if (!selectionState.getAnchorKey()) {
                selectionState = selectionState.set(
                    'anchorKey',
                    parentBlockKey,
                ) as SelectionState
            }

            if (j === blocks.length) {
                return selectionState.merge({
                    focusKey: parentBlockKey,
                    focusOffset: parentBlock.getLength(),
                })
            }
        } else {
            j = 0
            selectionState = SelectionState.createEmpty('')
        }
    }

    return null
}

export const truncateContentStateBlocks = (
    contentState: ContentState,
    n: number,
): ContentState => {
    if (n < 0) {
        throw new Error('Negative number of blocks')
    } else if (n >= contentState.getBlocksAsArray().length) {
        return contentState
    }
    return ContentState.createFromBlockArray(
        contentState.getBlocksAsArray().slice(0, n),
    )
}

export const truncateContentStateWords = (
    contentState: ContentState,
    n: number,
): ContentState => {
    if (n < 0) {
        throw new Error('Negative number of words')
    }

    const newBlocks: ContentBlock[] = []
    let wordsCount = 0
    for (const block of contentState.getBlocksAsArray()) {
        const blockWordsCount = countWords(block.getText())
        if (wordsCount + blockWordsCount <= n) {
            newBlocks.push(block)
            wordsCount += blockWordsCount
        } else {
            newBlocks.push(
                block.set(
                    'text',
                    truncateWords(block.getText(), n - wordsCount),
                ) as ContentBlock,
            )
            return ContentState.createFromBlockArray(newBlocks)
        }
    }

    return contentState
}

export class ContentStateCounter {
    blocks = 0
    words = 0

    constructor(initialContentState?: ContentState) {
        this.reset(initialContentState)
    }

    addContentState = (contentState: ContentState) => {
        this.blocks += contentState.getBlocksAsArray().length
        this.words += countWords(contentState.getPlainText())
    }

    removeContentState = (contentState: ContentState) => {
        this.blocks -= contentState.getBlocksAsArray().length
        this.words -= countWords(contentState.getPlainText())
    }

    reset = (contentState?: ContentState) => {
        this.blocks = 0
        this.words = 0
        if (contentState) {
            this.addContentState(contentState)
        }
    }
}

// $TSFixMe: Move to draftTestUtils
export type BlockSnapshot = {
    data: Record<string, unknown>
    depth: number
    text: string
    type: string
}

// $TSFixMe: Move to draftTestUtils
export const getContentStateBlocksSnapshot = (
    contentState: ContentState,
): BlockSnapshot[] => {
    return contentState.getBlocksAsArray().map((block) => {
        return {
            data: block.getData().toJS(),
            depth: block.getDepth(),
            text: block.getText(),
            type: block.getType(),
        }
    })
}

export type ContentStateSelectionSnapshot = {
    anchorBlockText: string | null
    anchorOffset: string
    focusBlockText: string | null
    focusOffset: string
    hasFocus: boolean
    isBackward: false
}
export const getContentStateSelectionSnapshot = (
    contentState: ContentState,
    selectionState: SelectionState,
): ContentStateSelectionSnapshot => {
    const selectionStateJS = selectionState.toJS()
    delete (selectionStateJS as { anchorKey?: string }).anchorKey
    delete (selectionStateJS as { focusKey?: string }).focusKey
    return {
        ...selectionStateJS,
        anchorBlockText:
            contentState
                .getBlockForKey(selectionState.getAnchorKey())
                ?.getText() || null,
        focusBlockText:
            contentState
                .getBlockForKey(selectionState.getFocusKey())
                ?.getText() || null,
    } as ContentStateSelectionSnapshot
}

// $TSFixMe: Move to draftTestUtils
export const createDraftJSKeyGeneratorMock = () => {
    let counter = 0

    const generateKeyMock = () => {
        counter++
        return 'mock-key-' + counter.toString()
    }

    generateKeyMock.reset = () => {
        counter = 0
    }

    return generateKeyMock
}

export const focusToTheEndOfContent = (editorState: EditorState) => {
    const content = editorState.getCurrentContent()
    const blockMap = content.getBlockMap()

    const key = blockMap.last().getKey()
    const length = blockMap.last().getLength()

    // On Chrome and Safari, calling focus on contenteditable focuses the
    // cursor at the first character. This is something you don't expect when
    // you're clicking on an input element but not directly on a character.
    // Put the cursor back where it was before the blur.
    const selection = new SelectionState({
        anchorKey: key,
        anchorOffset: length,
        focusKey: key,
        focusOffset: length,
    })
    return EditorState.forceSelection(editorState, selection)
}
