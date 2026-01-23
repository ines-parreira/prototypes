import sanitizeHtml from 'sanitize-html'

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
