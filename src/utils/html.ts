import linkifyjsElement from 'linkifyjs/element'
import linkifyjsString from 'linkifyjs/string'
import _get from 'lodash/get'
import sanitizeHtml from 'sanitize-html'

export enum AllowedHTMLTags {
    H3 = 'h3',
    H4 = 'h4',
    H5 = 'h5',
    H6 = 'h6',
    Blockquote = 'blockquote',
    P = 'p',
    A = 'a',
    Ul = 'ul',
    Ol = 'ol',
    Nl = 'nl',
    Li = 'li',
    B = 'b',
    I = 'i',
    U = 'u',
    Strong = 'strong',
    Em = 'em',
    Ins = 'ins',
    Strike = 'strike',
    Code = 'code',
    Hr = 'hr',
    Br = 'br',
    Div = 'div',
    Table = 'table',
    Colgroup = 'colgroup',
    Col = 'col',
    Thead = 'thead',
    Caption = 'caption',
    Tbody = 'tbody',
    Tfoot = 'tfoot',
    Tr = 'tr',
    Th = 'th',
    Td = 'td',
    Pre = 'pre',
    Img = 'img',
    Font = 'font',
    Span = 'span',
    Audio = 'audio',
}

const linkifyOptions = {
    attributes: {
        rel: 'noreferrer noopener',
    },
}

/* Forgiving html parser:
 * - Fixes invalid markup
 * - Doesn't remove invalid chars
 * - Doesn't run scripts or inline event handlers
 * global is required for testing in a separate jsdom instance.
 */
export const parseHtml = (html = '', global = window): Document => {
    const parser = new global.DOMParser()
    return parser.parseFromString(html, 'text/html')
}

export const linkifyHtml = (body: string) => {
    const doc = parseHtml(body)
    const linkifiedBody = linkifyjsElement(doc.body, linkifyOptions)
    // merge head and body contents, in case we need to load resources from head.
    // also makes it backwards-compatible with the previous dom parser (div.innerHTML = html).
    return `${_get(doc, ['head', 'innerHTML'], '')}${
        linkifiedBody.innerHTML || ''
    }`
}

export const linkifyString = (body: string) =>
    linkifyjsString(body, linkifyOptions)

/** sanitizeHtml with a sensible config. */
export function sanitizeHtmlDefault(html: string): string {
    if (typeof html !== 'string') {
        return html
    }

    // Remove broken HTML comment, valid comments will be removed below
    const sanitizedHtml = html.replace('<!-->', '')

    return sanitizeHtml(sanitizedHtml, {
        allowedTags: Object.values(AllowedHTMLTags),
        allowedAttributes: {
            // allow style/src and other meta attributes
            '*': [
                'align',
                'alt',
                'bgcolor',
                'border',
                'class',
                'color',
                'colspan',
                'dir',
                'height',
                'href',
                'id',
                'rel',
                'rowspan',
                'src',
                'style',
                'target',
                'title',
                'width',
                'controls',
            ],
        },
        nonTextTags: [
            'style',
            'script',
            'textarea',
            'noscript',
            'title',
            'o:pixelsperinch', // outlook specific tag
        ],
        transformTags: {
            a: sanitizeHtml.simpleTransform('a', {
                target: '_blank',
                rel: 'noreferrer noopener',
            }),
        },
    })
}

/**
 * Remove all HTML tags except div, img, a and br.
 * Convert <a> tags from `<a href="http://x.io">this is a link</a>` to `this is a link: http://x.io`
 *
 * @param html
 */
export function sanitizeHtmlForFacebookMessenger(html: string): string {
    if (typeof html !== 'string') {
        return html
    }

    // Remove broken HTML comment, valid comments will be removed below
    let sanitizedHtml = html.replace('<!-->', '')

    sanitizedHtml = sanitizeHtml(sanitizedHtml, {
        allowedTags: ['div', 'img', 'a', 'br'],
        allowedAttributes: {
            // allow style/src and other meta attributes
            '*': [
                'id',
                'src',
                'alt',
                'class',
                'style',
                'width',
                'height',
                'href',
            ],
        },
        nonTextTags: [
            'style',
            'script',
            'textarea',
            'noscript',
            'title',
            'o:pixelsperinch', // outlook specific tag
        ],
        transformTags: {},
    })

    sanitizedHtml = sanitizedHtml
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')

    // Convert <a> tags from `<a href="http://x.io">this is a link</a>` to `this is a link: http://x.io`
    sanitizedHtml = sanitizedHtml.replace(
        /(<a[^>]*(href=[\"\'](.*?)[\"\'])[^>]*>)(.*?)(<\/a>)/gim,
        (
            full_match: string,
            full_a_tag: string,
            a_href: string,
            a_url: string,
            a_text: string
        ) => {
            // Remove trailing slash
            const _a_url = a_url.endsWith('/') ? a_url.slice(0, -1) : a_url
            const _a_text = a_text.endsWith('/') ? a_text.slice(0, -1) : a_text

            // handle empty text or spaces only in-between <a> tag
            if (!a_text.trim()) {
                return ` ${a_url} `
            }

            // if the text is the url don't convert
            if (_a_url.toLowerCase() === _a_text.toLowerCase()) {
                return ` ${a_url} `
            }

            return ` ${a_text}: ${a_url} `
        }
    )

    return sanitizedHtml
}

export function focusElement(getElement: () => HTMLElement) {
    setTimeout(() => {
        const element = getElement()

        if (element) {
            element.focus()
        }
    }, 0)
}
