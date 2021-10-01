import punycode from 'punycode'

import {
    convertToHTML as originalConvertToHTML,
    convertFromHTML as originalConvertFromHTML,
    IConvertFromHTMLConfig as originalIConvertFromHTMLConfig,
} from 'draft-convert'
import {
    AtomicBlockUtils,
    ContentState,
    DraftInlineStyle,
    EditorState,
    RichUtils,
} from 'draft-js'

type IConvertFromHTMLConfig = Omit<
    originalIConvertFromHTMLConfig,
    'htmlToStyle'
>

export const INJECTED_HTML_TYPE = 'INJECTED_HTML'
export const CODE_BLOCK = 'CODE_BLOCK'
export const VIDEO_TYPE = 'VIDEO'

const WIDGET_TYPE_INJECTED_CODE = 'injected-html'

const SUPPORTED_TAGS = [
    '#text',
    'a',
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'li',
    'ol',
    'ul',
    'strong',
    'em',
    'span',
    'div',
    'blockquote',
    'pre',
    'code',
    'image',
    'figure',
    'body',
]

function getWidgetType(node: HTMLElement): string {
    if (node.getAttribute) {
        return node.getAttribute('data-widgetType') || ''
    }

    return ''
}

export const convertToHTML = (contentState: ContentState): string =>
    originalConvertToHTML({
        styleToHTML: (style) => {
            if (style.indexOf('color-') > -1) {
                return {
                    start: `<span style="color: ${style.replace(
                        'color-',
                        ''
                    )}">`,
                    end: '</span>',
                }
            }
        },
        entityToHTML: (entity, originalText) => {
            if (entity.type === 'LINK') {
                const url = entity.data.url
                if (typeof url !== 'string') {
                    throw new Error(
                        `Entity of type 'LINK' was supposed to have an 'url'`
                    )
                }
                return `<a href="${url}">${originalText}</a>`
            }
            if (entity.type === 'IMAGE') {
                const src = entity.data.src
                if (typeof src !== 'string') {
                    throw new Error(
                        `Entity  of type 'IMAGE' was supposed to have a 'src'`
                    )
                }
                return `<img src="${src}" />`
            }
            if (entity.type === VIDEO_TYPE) {
                const {src, width = 500, height = 281} = entity.data
                if (
                    typeof src !== 'string' ||
                    typeof width !== 'number' ||
                    typeof height !== 'number'
                ) {
                    throw new Error(
                        `Entity  of type VIDEO was supposed to have 'src', 'width' and 'height' attributes`
                    )
                }
                return `
                    <iframe width=${width} height=${height} src="${src}" frameborder="0" allowfullscreen></iframe>
                `
            }
            if (entity.type === CODE_BLOCK) {
                const code = entity.data.code
                if (typeof code !== 'string') {
                    throw new Error(
                        `Entity  of type '${CODE_BLOCK}' was supposed to have a 'code'`
                    )
                }
                return `<pre>${code
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;')}</pre>`
            }
            if (entity.type === INJECTED_HTML_TYPE) {
                const src = entity.data.src
                if (typeof src !== 'string') {
                    throw new Error(
                        `Entity  of type 'INJECTED_HTML' was supposed to have a 'src'`
                    )
                }
                return src
            }
            return originalText
        },
        blockToHTML: (block) => {
            if (block.type === 'code') {
                return {start: '<pre>', end: '</pre>'}
            }
            if (block.type === 'atomic') {
                const contentBlock = contentState.getBlockForKey(block.key)
                const entityKey = contentBlock.getEntityAt(0)
                const entity = contentState.getEntity(entityKey)
                if (entity.getType() === INJECTED_HTML_TYPE) {
                    return {
                        start: `<div data-widgetType="${WIDGET_TYPE_INJECTED_CODE}">`,
                        end: '</div>',
                    }
                }
            }
            return undefined
        },
    })(contentState)

const isUnsupportedNodeName = (nodeName: string): boolean =>
    !SUPPORTED_TAGS.includes(nodeName.toLowerCase())

export const convertFromHTML = (html: string): ContentState =>
    originalConvertFromHTML({
        htmlToStyle: (
            nodeName: string,
            node: HTMLElement,
            currentStyle: DraftInlineStyle
        ) => {
            if (node?.style?.color) {
                return currentStyle.add(`color-${node.style.color}`)
            }
            return currentStyle
        },
        htmlToEntity: (nodeName, node, createEntity) => {
            const widgetType = getWidgetType(node)

            if (nodeName === 'a') {
                return createEntity('LINK', 'MUTABLE', {
                    url: node.getAttribute('href'),
                })
            }
            if (nodeName === 'img') {
                return createEntity('IMAGE', 'MUTABLE', {
                    src: node.getAttribute('src'),
                })
            }
            if (nodeName === 'iframe') {
                const src = getSrc({src: node.getAttribute('src') || ''})
                const width = Number(node.getAttribute('width')) || 500
                const height = Number(node.getAttribute('height')) || 281

                if (src) {
                    return createEntity(VIDEO_TYPE, 'IMMUTABLE', {
                        src,
                        width,
                        height,
                    })
                }
                return createEntity(INJECTED_HTML_TYPE, 'MUTABLE', {
                    src: node.outerHTML,
                })
            }
            if (nodeName === 'pre') {
                return createEntity(CODE_BLOCK, 'MUTABLE', {
                    code: node.innerHTML
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .replace(/&#039;/g, `'`),
                })
            }

            if (widgetType === WIDGET_TYPE_INJECTED_CODE) {
                const entity = createEntity(INJECTED_HTML_TYPE, 'MUTABLE', {
                    src: node.innerHTML,
                })
                // we need to remove all children from the node so that they are not
                // converted into blocks
                while (node.firstChild) {
                    node.removeChild(node.firstChild)
                }
                return entity
            }

            if (isUnsupportedNodeName(nodeName)) {
                const entity = createEntity(INJECTED_HTML_TYPE, 'MUTABLE', {
                    src: node.outerHTML,
                })
                // we need to remove all children from the node so that they are not
                // converted into blocks
                while (node.firstChild) {
                    node.removeChild(node.firstChild)
                }
                return entity
            }
        },
        htmlToBlock: (nodeName, node) => {
            const {firstChild} = node
            const widgetType = getWidgetType(node)
            if (
                nodeName === 'figure' &&
                firstChild instanceof HTMLElement &&
                firstChild.nodeName === 'IMG'
            ) {
                return {type: 'atomic', data: {}}
            }
            if (nodeName === 'img') {
                return {type: 'atomic', data: {}}
            }
            if (nodeName === 'pre') {
                return {type: 'atomic', data: {}}
            }
            if (
                nodeName === 'div' &&
                widgetType === WIDGET_TYPE_INJECTED_CODE
            ) {
                return {type: 'atomic', data: {}}
            }
            if (
                nodeName === 'div' &&
                firstChild instanceof HTMLElement &&
                isUnsupportedNodeName(firstChild.nodeName)
            ) {
                return {type: 'atomic', data: {}}
            }
            if (isUnsupportedNodeName(nodeName)) {
                return {type: 'atomic', data: {}}
            }
        },
    } as IConvertFromHTMLConfig)(html)

export const getCharCount = (plainText: string): number => {
    const decodeUnicode = (str: string): number[] => punycode.ucs2.decode(str) // func to handle unicode characters
    const regex = /(?:\r\n|\r|\n)/g // new line, carriage return, line feed
    const cleanString = plainText.replace(regex, '').trim() // replace above characters w/ nothing
    return decodeUnicode(cleanString).length
}

export const getWordCount = (plainText: string): number => {
    const regex = /(?:\r\n|\r|\n)/g // new line, carriage return, line feed
    const cleanString = plainText.replace(regex, ' ').trim() // replace above characters w/ space
    const wordArray = cleanString.match(/\S+/g) // matches words according to whitespace
    return wordArray ? wordArray.length : 0
}

export const addVideo = (
    editorState: EditorState,
    {src, width, height}: {src: string; width: number; height: number}
): EditorState => {
    if (RichUtils.getCurrentBlockType(editorState) === 'atomic') {
        return editorState
    }
    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity(
        VIDEO_TYPE,
        'IMMUTABLE',
        {src, width, height}
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ')
}

export const insertCodeEditor = (
    editorState: EditorState,
    type: string
): EditorState => {
    if (RichUtils.getCurrentBlockType(editorState) === 'atomic') {
        return editorState
    }
    const contentState = editorState.getCurrentContent()

    if (type === CODE_BLOCK) {
        const contentStateWithEntity = contentState.createEntity(
            type,
            'MUTABLE',
            {
                code: ``,
            }
        )

        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
        return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ')
    } else if (type === INJECTED_HTML_TYPE) {
        const contentStateWithEntity = contentState.createEntity(
            type,
            'MUTABLE',
            {
                src: ``,
            }
        )

        const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
        return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ')
    }

    throw Error(`Unhandled type!`)
}

const YOUTUBE_MATCH_URL = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/
const VIMEO_MATCH_URL = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/ // eslint-disable-line no-useless-escape
const LOOM_MATCH_URL = /^(?:https?:\/\/)?(?:www\.)?(?:loom\.com\/(?:embed\/|share\/))((\w|-){32})(?:\S+)?$/
const DAILY_MOTION_MATCH_URL = /^(?:https?:\/\/)?(?:www\.)?(?:dailymotion\.com\/(?:embed\/video\/|video\/))((\w|-){7})(?:\S+)?$/

export const isYoutube = (url: string): boolean => YOUTUBE_MATCH_URL.test(url)
export const isVimeo = (url: string): boolean => VIMEO_MATCH_URL.test(url)
export const isLoom = (url: string): boolean => LOOM_MATCH_URL.test(url)
export const isDailyMotion = (url: string): boolean =>
    DAILY_MOTION_MATCH_URL.test(url)

export type SourceType = 'youtube' | 'vimeo' | 'loom' | 'dailyMotion'

export interface SourceResult {
    srcID: string
    srcType: SourceType
    url: string
}

export const getYoutubeSrc = (url: string): SourceResult => {
    const parsedSrc = YOUTUBE_MATCH_URL.exec(url)
    const id = (parsedSrc && parsedSrc[1]) || ''
    return {
        srcID: id,
        srcType: 'youtube',
        url,
    }
}

export const getLoomSrc = (url: string): SourceResult => {
    const parsedSrc = LOOM_MATCH_URL.exec(url)
    const id = (parsedSrc && parsedSrc[1]) || ''
    return {
        srcID: id,
        srcType: 'loom',
        url,
    }
}

export const getVimeoSrc = (url: string): SourceResult => {
    const parsedSrc = VIMEO_MATCH_URL.exec(url)
    const id = (parsedSrc && parsedSrc[3]) || ''
    return {
        srcID: id,
        srcType: 'vimeo',
        url,
    }
}

export const getDailyMotionSrc = (url: string): SourceResult => {
    const parsedSrc = DAILY_MOTION_MATCH_URL.exec(url)
    const id = (parsedSrc && parsedSrc[1]) || ''
    return {
        srcID: id,
        srcType: 'dailyMotion',
        url,
    }
}

const YOUTUBE_PREFIX = 'https://www.youtube.com/embed/'
const VIMEO_PREFIX = 'https://player.vimeo.com/video/'
const LOOM_PREFIX = 'https://www.loom.com/embed/'
const DAILY_MOTION_PREFIX = 'https://www.dailymotion.com/embed/video/'

export const getSrc = ({src}: {src: string}): string | undefined => {
    if (isYoutube(src)) {
        const {srcID} = getYoutubeSrc(src)
        return `${YOUTUBE_PREFIX}${srcID}`
    }
    if (isVimeo(src)) {
        const {srcID} = getVimeoSrc(src)
        return `${VIMEO_PREFIX}${srcID}`
    }
    if (isLoom(src)) {
        const {srcID} = getLoomSrc(src)
        return `${LOOM_PREFIX}${srcID}`
    }
    if (isDailyMotion(src)) {
        const {srcID} = getDailyMotionSrc(src)
        return `${DAILY_MOTION_PREFIX}${srcID}`
    }
    return undefined
}
