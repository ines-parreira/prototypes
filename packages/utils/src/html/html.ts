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

export const parseHtml = (html = '', global = window): Document => {
    const parser = new global.DOMParser()
    return parser.parseFromString(html, 'text/html')
}

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

/**
 * Extract `<div class="gorgias-video-container" data-video-src="https://www.youtube.com/watch?v=4sLFpe-xbhk" width="600"></div>` elements from html, and return `data-video-src` urls separately.
 */
export function extractGorgiasVideoDivFromHtmlContent(html: string): {
    htmlCleaned: string
    videoUrls: string[]
} {
    const regex = new RegExp(
        '<div class="gorgias-video-container" data-video-src="(.+?)".+?></div>',
        'g',
    )

    const urls = []
    let result: RegExpExecArray | null
    while ((result = regex.exec(html)) !== null) {
        urls.push(result[1])
    }

    let htmlCleaned = html.replace(regex, '')

    // Remove the ending `<div><br /></div>` if any when ending with a video content.
    // This is an unwanted extra space produced by draftjs editor because there will be an empty line below the video when content ends by a video.
    if (
        html.match(
            /<div class="gorgias-video-container" data-video-src=".+?".+?>(<\/div><div><br.{0,2}><\/div>)$/,
        )
    ) {
        htmlCleaned = htmlCleaned.replace(/<div><br.{0,2}><\/div>$/, '')
    }

    return {
        htmlCleaned: htmlCleaned,
        videoUrls: urls,
    }
}
