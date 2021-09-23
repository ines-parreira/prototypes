import punycode from 'punycode'

import {
    convertToHTML as originalConvertToHTML,
    convertFromHTML as originalConvertFromHTML,
    IConvertFromHTMLConfig,
} from 'draft-convert'
import {ContentState} from 'draft-js'

export const INJECTED_HTML_TYPE = 'INJECTED_HTML'
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
    'blockquote',
    'pre',
    'code',
    'image',
    'figure',
    'div',
    'body',
]

export const convertToHTML = (contentState: ContentState): string =>
    originalConvertToHTML({
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
                if (entity.getType() === INJECTED_HTML_TYPE)
                    return {start: '<div>', end: '</div>'}
            }
            return undefined
        },
    })(contentState)

const isUnsupportedNodeName = (nodeName: string): boolean =>
    !SUPPORTED_TAGS.includes(nodeName.toLowerCase())

export const convertFromHTML = (html: string): ContentState =>
    originalConvertFromHTML({
        htmlToEntity: (nodeName, node, createEntity) => {
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
                return {type: 'code', data: {}}
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
