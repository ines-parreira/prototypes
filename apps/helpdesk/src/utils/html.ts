import linkifyjsElement from 'linkify-element'
import linkifyjsString from 'linkify-string'
import _get from 'lodash/get'
import sanitizeHtml from 'sanitize-html'

const linkifyOptions = {
    attributes: {
        rel: 'noreferrer noopener',
    },
    className: 'linkified',
    target: (_href: unknown, type: string) =>
        type === 'url' ? '_blank' : '_self',
}

/** Forgiving html parser:
 * - Fixes invalid markup
 * - Doesn't remove invalid chars
 * - Doesn't run scripts or inline event handlers
 * global is required for testing in a separate jsdom instance.
 * @deprecated use the @repo/utils version instead
 * @date 2026-03-02
 * @type migration to @repo/utils
 */
export const parseHtml = (html = '', global = window): Document => {
    const parser = new global.DOMParser()
    return parser.parseFromString(html, 'text/html')
}

/**
 * @deprecated use the @repo/utils version instead
 * @date 2026-03-02
 * @type migration to @repo/utils
 */
export const linkifyHtml = (body: string) => {
    // parse html before linkifying it.
    // linkifyjs's html tokenizer (simple-html-tokenizer) breaks and returns empty string
    // when encountering invalid chars or unsupported tags (CDATA, DOCTYPE, MDO, etc.).
    const doc = parseHtml(body)
    const linkifiedBody = linkifyjsElement(doc.body, linkifyOptions)
    // merge head and body contents, in case we need to load resources from head.
    // also makes it backwards-compatible with the previous dom parser (div.innerHTML = html).
    return `${_get(doc, ['head', 'innerHTML'], '')}${
        linkifiedBody.innerHTML || ''
    }`
}

/**
 * @deprecated use the @repo/utils version instead
 * @date 2026-03-02
 * @type migration to @repo/utils
 */
export const linkifyString = (body: string) =>
    linkifyjsString(body, linkifyOptions)

/**
 * @deprecated use sanitizeHtmlDefault from @repo/utils
 * @date 2026-01-23
 * @type migration to @repo/utils
 * sanitizeHtml with a sensible config.
 */
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
                'data-discount-code', // used for chat discount sharing.
            ],
        },
        allowedSchemes: ['http', 'https', 'data'],
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

export function sanitizeHtmlMinimal(html: string): string {
    if (typeof html !== 'string') return html

    // Remove broken HTML comment, empty <p> tags and multiple <br> tags
    const sanitizedHtml = html
        .replace('<!-->', '')
        .replace(/(<br\s*\/?>\s*){2,}/gi, '<br>')
        .replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, '')

    return sanitizeHtml(sanitizedHtml, {
        allowedTags: ['div', 'img', 'a', 'p', 'br', 'span', 'ul', 'li'],
        allowedAttributes: {
            a: ['href', 'title'],
            img: ['src', 'alt'],
        },
        allowedSchemes: ['http', 'https', 'data'],
        nonTextTags: [
            'style',
            'script',
            'textarea',
            'noscript',
            'title',
            'o:pixelsperinch',
        ],
        transformTags: {
            a: sanitizeHtml.simpleTransform('a', {
                target: '_blank',
                rel: 'noreferrer noopener',
            }),
            h1: 'div',
            h2: 'div',
            h3: 'div',
            h4: 'div',
            h5: 'div',
            h6: 'div',
        },
        exclusiveFilter: (frame) => frame.tag === 'meta',
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
            a_text: string,
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
        },
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

export function textToHTML(text: string): string {
    const div = document.createElement('div')
    div.innerHTML = text.replace(/\n/g, '<br>')
    return div.outerHTML
}

export function trimHTML(html: string): string {
    const { body } = parseHtml(html.trim())

    const shouldTrim = (node: Element | null) =>
        node &&
        (node.tagName.toLowerCase() === 'br' ||
            (node.tagName.toLowerCase() === 'div' &&
                node.textContent?.trim().length === 0))

    while (shouldTrim(body.lastElementChild)) body.lastElementChild!.remove()
    while (shouldTrim(body.firstElementChild)) body.firstElementChild!.remove()

    if (body.lastElementChild) {
        body.lastElementChild.innerHTML =
            body.lastElementChild.innerHTML.trimRight()
    }
    if (body.firstElementChild) {
        body.firstElementChild.innerHTML =
            body.firstElementChild.innerHTML.trimLeft()
    }

    return body.innerHTML
}

/**
 * Replaces all link elements with their inner text
 *
 * @param html
 */
export const removeLinksFromHtml = (html = '') => {
    const doc = parseHtml(html)

    const linkElements = doc.querySelectorAll('a')
    linkElements.forEach((linkElement) => {
        const parentNode = linkElement.parentNode
        if (parentNode) {
            const linkText = doc.createTextNode(linkElement.textContent || '')
            parentNode.replaceChild(linkText, linkElement)
        }
    })

    return doc.body.innerHTML
}

export function unescapeAmpAndDollarEntities(html: string): string {
    if (typeof html !== 'string') {
        return html
    }

    const entities: Record<string, string> = {
        '&amp;': '&',
        '&#x26;': '&',
        '&#38;': '&',
        '&#36;': '$',
        '&dollar;': '$',
    }

    const rex = new RegExp(Object.keys(entities).join('|'), 'g')

    return html.replace(rex, (matched) => entities[matched])
}

/**
 * Normalize HTML by parsing and serializing it back through the DOM parser,
 * then applying additional transformations to match Draft.js editor output.
 * This ensures consistent HTML representation by applying:
 * - Character entities: & -> &amp;
 * - Empty paragraphs: <p><br /></p> or <p><br></p> -> <p></p>
 * - Paragraph/div normalization: <div> tags are converted to <p> tags
 * - Text content trimming: leading/trailing whitespace in text nodes is removed
 * - Empty formatting tags: removes empty <strong>, <em>, <b>, <i>, <u>, <span> tags
 * - Link attributes: removes target="_blank" for consistency
 * - Trailing slashes in URLs: http://example.com/ -> http://example.com
 *
 * Useful for comparing HTML strings that may have been processed by different editors
 * or loaded at different times, ensuring structural equality.
 */
export function normalizeHtml(html: string): string {
    if (!html) return ''
    const doc = parseHtml(html)

    // Normalize <div> and <p> tags by converting all <div> to <p>
    const divs = doc.querySelectorAll('div')
    divs.forEach((div) => {
        const p = doc.createElement('p')
        Array.from(div.attributes).forEach((attr) => {
            p.setAttribute(attr.name, attr.value)
        })
        while (div.firstChild) {
            p.appendChild(div.firstChild)
        }
        div.parentNode?.replaceChild(p, div)
    })

    // Trim text content within elements
    const trimTextNodes = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent) {
                node.textContent = node.textContent.trim()
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(trimTextNodes)
        }
    }
    trimTextNodes(doc.body)

    // Remove <br> tags that are the only child of a p
    const paragraphs = doc.querySelectorAll('p')
    paragraphs.forEach((p) => {
        if (p.childNodes.length === 1 && p.firstChild?.nodeName === 'BR') {
            p.removeChild(p.firstChild)
        }
    })

    // Remove empty formatting tags (strong, em, b, i, u, etc.) that have no content
    const formattingTags = ['strong', 'em', 'b', 'i', 'u', 'span']
    formattingTags.forEach((tagName) => {
        const elements = doc.querySelectorAll(tagName)
        elements.forEach((element) => {
            if (
                element.textContent?.trim() === '' &&
                element.childNodes.length === 0
            ) {
                element.remove()
            }
        })
    })

    // Normalize link attributes for consistent comparison
    const links = doc.querySelectorAll('a')
    links.forEach((link) => {
        // Remove target attribute
        link.removeAttribute('target')

        // Remove trailing slash from href for consistency
        const href = link.getAttribute('href')
        if (href && href.endsWith('/')) {
            link.setAttribute('href', href.slice(0, -1))
        }
    })

    return doc.body.innerHTML
}
