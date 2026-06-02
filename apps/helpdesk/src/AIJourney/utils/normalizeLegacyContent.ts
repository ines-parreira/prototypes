import { ContentState } from 'draft-js'

import { convertFromHTML, convertToHTML } from 'utils/editor'

// Require a closing tag, a self-closing/void element, or a paired open+close so
// short literal tokens in legacy prose (e.g. "Hi <a customer>") don't get
// mistaken for HTML and corrupted by the Draft.js parser.
const HTML_TAG_PATTERN =
    /<\/(p|div|span|strong|b|em|i|u|a|ul|ol|li|h[1-6]|blockquote|figure|pre)>|<(br|hr|img)\s*\/?>|<(p|div|span|strong|b|em|i|u|a|ul|ol|li|h[1-6]|blockquote|figure|pre)\b[^>]*>[\s\S]*<\/\3>/i

export const normalizeLegacyContent = (raw: string | null | undefined) => {
    if (!raw) {
        return ''
    }

    if (HTML_TAG_PATTERN.test(raw)) {
        return raw
    }

    return convertToHTML(
        ContentState.createFromText(raw.replace(/\r\n?/g, '\n')),
    )
}

export const stabilize = (html: string): string => {
    if (!html) return ''
    try {
        return convertToHTML(convertFromHTML(html))
    } catch {
        return html
    }
}
