// @flow

import linkifyjsElement from 'linkifyjs/element'
import linkifyjsString from 'linkifyjs/string'
import _get from 'lodash/get'
import sanitizeHtml from 'sanitize-html'

const linkifyOptions = {
    attributes: {
        rel: 'noreferrer noopener'
    }
}

/* Forgiving html parser:
 * - Fixes invalid markup
 * - Doesn't remove invalid chars
 * - Doesn't run scripts or inline event handlers
 * global is required for testing in a separate jsdom instance.
 */
export const parseHtml = (html: string = '', global: window = window): Document => {
    const parser = new global.DOMParser()
    return parser.parseFromString(html, 'text/html')
}

export const linkifyHtml = (body: string) => {
    const doc = parseHtml(body)
    const linkifiedBody = linkifyjsElement(doc.body, linkifyOptions)
    // merge head and body contents, in case we need to load resources from head.
    // also makes it backwards-compatible with the previous dom parser (div.innerHTML = html).
    return `${_get(doc, ['head', 'innerHTML'], '')}${linkifiedBody.innerHTML || ''}`
}

export const linkifyString = (body: string) => linkifyjsString(body, linkifyOptions)

/** sanitizeHtml with a sensible config. */
export function sanitizeHtmlDefault(html: string): string {
    if (typeof html !== 'string') {
        return html
    }

    // Remove broken HTML comment, valid comments will be removed below
    const sanitizedHtml = html.replace('<!-->', '')

    return sanitizeHtml(sanitizedHtml, {
        allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
            'nl', 'li', 'b', 'i', 'u', 'strong', 'em', 'ins', 'strike', 'code', 'hr', 'br', 'div',
            'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 'font', 'span', 'audio'],
        allowedAttributes: {
            // allow style/src and other meta attributes
            '*': ['align', 'alt', 'bgcolor', 'border', 'class', 'color', 'colspan', 'dir',
                'height', 'href', 'id', 'rel', 'rowspan', 'src', 'style', 'target', 'title', 'width', 'controls']
        },
        nonTextTags: ['style', 'script', 'textarea', 'noscript', 'title',
            'o:pixelsperinch' // outlook specific tag
        ],
        transformTags: {
            'a': sanitizeHtml.simpleTransform('a', {target: '_blank', rel: 'noreferrer noopener'})
        }
    })
}

export function focusElement(getElement: () => HTMLElement) {
    setTimeout(() => {
        const element = getElement()

        if (element) {
            element.focus()
        }
    }, 0)
}
