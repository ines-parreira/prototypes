import linkifyjsElement from 'linkifyjs/element'
import linkifyjsString from 'linkifyjs/string'
import _get from 'lodash/get'
import sanitizeHtml from 'sanitize-html'

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
        allowedTags: [
            'h3',
            'h4',
            'h5',
            'h6',
            'blockquote',
            'p',
            'a',
            'ul',
            'ol',
            'nl',
            'li',
            'b',
            'i',
            'u',
            'strong',
            'em',
            'ins',
            'strike',
            'code',
            'hr',
            'br',
            'div',
            'table',
            'colgroup',
            'col',
            'thead',
            'caption',
            'tbody',
            'tfoot',
            'tr',
            'th',
            'td',
            'pre',
            'img',
            'font',
            'span',
            'audio',
        ],
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
                'data-video-src', // used for chat video sharing.
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

/**
 * This method converts the single and double quote entities to their string literals.
 *
 * Accepted types: html entity, hex code, decimal code
 */
export function unescapeQuoteEntities(html: string): string {
    if (typeof html !== 'string') {
        return html
    }

    const quoteEntities: Record<string, string> = {
        // single quote
        '&apos;': "'", // html entity
        '&#x27;': "'", // hex code
        '&#39;': "'", // decimal code
        // double quote
        '&quot;': '"', // html entity
        '&#x22;': '"', // hex code
        '&#34;': '"', // decimal code
    }

    const rex = new RegExp(Object.keys(quoteEntities).join('|'), 'g')

    return html.replace(rex, (matched) => quoteEntities[matched])
}
